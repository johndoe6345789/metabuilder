#!/usr/bin/env python3
"""
Styling quality metrics for all frontends.

Scores 0-100 per dimension, then a weighted overall score.

Dimensions:
  inline_style   — style={{}} props in JSX (bad)
  sx_prop        — sx={{}} MUI/FakeMUI inline styles (bad)
  color_tokens   — % of color usage that comes from CSS vars vs hardcoded hex
  important      — !important usage (bad)
  px_magic       — hardcoded pixel values in JSX (bad)
  scss_nesting   — deep SCSS nesting (>3 levels, bad)
  design_tokens  — existence of a tokens/theme file and CSS var adoption rate

Usage:
  python3 scripts/style-quality.py              # all frontends
  python3 scripts/style-quality.py postgres     # one frontend
  python3 scripts/style-quality.py --json       # machine-readable
  python3 scripts/style-quality.py --save       # snapshot to reports.db
  python3 scripts/style-quality.py --history    # show trend
"""

import argparse
import json
import os
import re
import sqlite3
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).parent.parent
FRONTENDS_DIR = ROOT / "frontends"
DB_PATH = ROOT / "txt" / "reports.db"

FRONTENDS = [
    "postgres", "workflowui", "pastebin",
    "codegen", "dbal", "exploded-diagrams",
]

SKIP_DIRS = {
    "node_modules", ".next", "coverage", "__pycache__",
    ".storybook", "dist", "out", ".turbo",
}

# Weights for overall score (must sum to 1.0)
WEIGHTS = {
    "color_tokens":   0.25,
    "inline_style":   0.20,
    "scss_nesting":   0.20,
    "sx_prop":        0.15,
    "px_magic":       0.10,
    "important":      0.10,
}

TOKEN_FILES = {
    "theme.ts", "theme.tsx", "theme.scss", "tokens.json",
    "variables.scss", "_variables.scss", "tokens.scss",
    "theme-schema.ts", "colors.ts", "colors.scss",
}


def walk(base: Path, exts: set):
    for path in base.rglob("*"):
        if path.is_file() and path.suffix in exts:
            parts = set(path.relative_to(base).parts[:-1])
            if not (parts & SKIP_DIRS):
                yield path


def count_pattern(path: Path, pattern: str) -> int:
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
        return len(re.findall(pattern, text))
    except OSError:
        return 0


def count_lines(path: Path) -> int:
    try:
        return len(path.read_text(encoding="utf-8", errors="replace").splitlines())
    except OSError:
        return 0


def score_inline_style(occurrences: int, tsx_files: int) -> float:
    """Penalise style={{}} in JSX. 0 per file = 100, ~1/file = 80, ~5/file = 0."""
    if tsx_files == 0:
        return 100.0
    rate = occurrences / tsx_files
    return max(0.0, 100.0 - rate * 20.0)


def score_sx_prop(occurrences: int, tsx_files: int) -> float:
    """Penalise sx={{}} MUI inline props. 0 per file = 100, ~5/file = 50."""
    if tsx_files == 0:
        return 100.0
    rate = occurrences / tsx_files
    return max(0.0, 100.0 - rate * 10.0)


def score_color_tokens(css_vars: int, hex_colors: int) -> float:
    """Reward CSS variable usage vs raw hex. 100% vars = 100, 0% = 0."""
    total = css_vars + hex_colors
    if total == 0:
        return 80.0   # no color refs at all → neutral
    return round(100.0 * css_vars / total, 1)


def score_important(count: int, total_css_lines: int) -> float:
    """Penalise !important. 0 uses = 100; each use costs proportionally."""
    if count == 0:
        return 100.0
    if total_css_lines == 0:
        return max(0.0, 100.0 - count * 5.0)
    rate = count / total_css_lines
    return max(0.0, 100.0 - rate * 2000.0)


def score_px_magic(px_in_jsx: int, tsx_files: int) -> float:
    """Penalise hardcoded px values in JSX. 0 = 100, 1/file = 80."""
    if tsx_files == 0:
        return 100.0
    rate = px_in_jsx / tsx_files
    return max(0.0, 100.0 - rate * 20.0)


def score_scss_nesting(deep_lines: int, total_scss_lines: int) -> float:
    """Penalise SCSS lines with >3 levels of nesting (8+ spaces indent).
    0% deep = 100, 5% deep = 0."""
    if total_scss_lines == 0:
        return 100.0
    rate = deep_lines / total_scss_lines
    return max(0.0, 100.0 - rate * 2000.0)


def has_token_file(base: Path) -> bool:
    for path in base.rglob("*"):
        if path.name in TOKEN_FILES:
            parts = set(path.relative_to(base).parts[:-1])
            if not (parts & SKIP_DIRS):
                return True
    return False


def scan_frontend(name: str) -> dict:
    base = FRONTENDS_DIR / name / "src"
    if not base.exists():
        base = FRONTENDS_DIR / name
    if not base.exists():
        return {"frontend": name, "error": "src/ not found"}

    tsx_files   = list(walk(base, {".tsx"}))
    ts_files    = list(walk(base, {".ts"}))
    scss_files  = list(walk(base, {".scss", ".css"}))

    tsx_count   = len(tsx_files)
    scss_lines  = sum(count_lines(p) for p in scss_files)

    # --- inline style={{}} ---
    inline_style = sum(
        count_pattern(p, r'style=\{\{') for p in tsx_files
    )

    # --- sx={{}} ---
    sx_prop = sum(
        count_pattern(p, r'sx=\{\{') for p in tsx_files + ts_files
    )

    # --- hardcoded hex colors (all text files) ---
    hex_colors = sum(
        count_pattern(p, r'#[0-9a-fA-F]{3,8}\b')
        for p in tsx_files + ts_files + scss_files
    )

    # --- CSS variable uses ---
    css_vars = sum(
        count_pattern(p, r'var\(--')
        for p in tsx_files + ts_files + scss_files
    )

    # --- !important ---
    important = sum(
        count_pattern(p, r'!important') for p in scss_files + tsx_files
    )

    # --- hardcoded px in JSX ---
    px_magic = sum(
        count_pattern(p, r"'\d+px'|\"\d+px\"")
        for p in tsx_files
    )

    # --- deep SCSS nesting (≥8 spaces = 4+ levels of 2-space nesting) ---
    deep_nesting = sum(
        count_pattern(p, r'^\s{8,}\S')
        for p in scss_files
    )

    # --- design token file presence ---
    token_file = has_token_file(FRONTENDS_DIR / name)

    # --- scores ---
    scores = {
        "inline_style": score_inline_style(inline_style, tsx_count),
        "sx_prop":       score_sx_prop(sx_prop, tsx_count),
        "color_tokens":  score_color_tokens(css_vars, hex_colors),
        "important":     score_important(important, scss_lines),
        "px_magic":      score_px_magic(px_magic, tsx_count),
        "scss_nesting":  score_scss_nesting(deep_nesting, scss_lines),
    }

    overall = sum(WEIGHTS[k] * v for k, v in scores.items())

    return {
        "frontend":     name,
        "overall":      round(overall, 1),
        "scores":       {k: round(v, 1) for k, v in scores.items()},
        "raw": {
            "tsx_files":    tsx_count,
            "inline_style": inline_style,
            "sx_prop":      sx_prop,
            "hex_colors":   hex_colors,
            "css_vars":     css_vars,
            "important":    important,
            "px_magic":     px_magic,
            "deep_nesting": deep_nesting,
            "scss_lines":   scss_lines,
            "token_file":   token_file,
        },
    }


def grade(score: float) -> str:
    if score >= 90: return "A"
    if score >= 80: return "B"
    if score >= 70: return "C"
    if score >= 60: return "D"
    return "F"


def print_report(results: list[dict]) -> None:
    RESET  = "\033[0m"
    RED    = "\033[31m"
    YELLOW = "\033[33m"
    GREEN  = "\033[32m"
    BOLD   = "\033[1m"
    DIM    = "\033[2m"

    def colour(s):
        if s >= 80: return GREEN
        if s >= 60: return YELLOW
        return RED

    print(f"\n{BOLD}Styling Quality Report — {datetime.now():%Y-%m-%d %H:%M}{RESET}")
    print("=" * 72)
    print(f"  {'Frontend':22s}  {'Overall':>7}  "
          f"{'Tokens':>6}  {'NoStyle':>7}  {'NoSx':>5}  "
          f"{'NoPx':>5}  {'SCSS':>5}  {'NoImp':>6}  Grade")
    print("-" * 72)

    for r in results:
        if "error" in r:
            print(f"  {r['frontend']:22s}  ERROR: {r['error']}")
            continue
        s = r["scores"]
        o = r["overall"]
        c = colour(o)
        g = grade(o)
        print(
            f"  {r['frontend']:22s}  "
            f"{c}{o:6.1f}%{RESET}  "
            f"{colour(s['color_tokens'])}{s['color_tokens']:5.0f}%{RESET}  "
            f"{colour(s['inline_style'])}{s['inline_style']:6.0f}%{RESET}  "
            f"{colour(s['sx_prop'])}{s['sx_prop']:4.0f}%{RESET}  "
            f"{colour(s['px_magic'])}{s['px_magic']:4.0f}%{RESET}  "
            f"{colour(s['scss_nesting'])}{s['scss_nesting']:4.0f}%{RESET}  "
            f"{colour(s['important'])}{s['important']:5.0f}%{RESET}  "
            f"{c}{BOLD}{g}{RESET}"
        )

    print("=" * 72)
    print(f"\n{DIM}Columns: Overall | Color-tokens% | No-inline-style% | No-sx-prop% | "
          f"No-px-magic% | SCSS-shallow% | No-!important%{RESET}\n")

    # per-frontend detail
    for r in results:
        if "error" in r:
            continue
        rw = r["raw"]
        issues = []
        s = r["scores"]
        if s["color_tokens"] < 60:
            issues.append(
                f"    color tokens:  {rw['css_vars']} CSS vars vs "
                f"{rw['hex_colors']} hardcoded hex → centralise colors"
            )
        if s["inline_style"] < 80:
            issues.append(
                f"    inline styles: {rw['inline_style']} style={{{{}}}} across "
                f"{rw['tsx_files']} components → move to CSS/SCSS"
            )
        if s["sx_prop"] < 80:
            issues.append(
                f"    sx props:      {rw['sx_prop']} sx={{{{}}}} uses → "
                "use className + SCSS modules"
            )
        if s["px_magic"] < 80:
            issues.append(
                f"    px magic nums: {rw['px_magic']} hardcoded px in JSX → "
                "use spacing tokens"
            )
        if s["scss_nesting"] < 80:
            issues.append(
                f"    SCSS nesting:  {rw['deep_nesting']} deeply-nested lines / "
                f"{rw['scss_lines']} total → flatten selectors"
            )
        if s["important"] < 80:
            issues.append(
                f"    !important:    {rw['important']} uses → "
                "fix specificity instead"
            )
        if not rw["token_file"]:
            issues.append(
                "    design tokens: no tokens/theme file found → "
                "add tokens.json or theme.ts"
            )
        if issues:
            print(f"  {BOLD}{r['frontend']}{RESET} ({grade(r['overall'])}):")
            print("\n".join(issues))
            print()


def save_snapshot(results: list[dict]) -> None:
    if not DB_PATH.exists():
        return
    try:
        conn = sqlite3.connect(DB_PATH)
        ts = datetime.now().isoformat()
        summary = {
            r["frontend"]: {
                "overall": r.get("overall"),
                "scores": r.get("scores"),
            }
            for r in results if "error" not in r
        }
        avg = sum(r["overall"] for r in results if "error" not in r)
        cnt = sum(1 for r in results if "error" not in r)
        avg_score = round(avg / max(cnt, 1), 1)
        title = (
            f"Style Quality Snapshot {ts[:10]} — "
            f"avg {avg_score:.1f}/100"
        )
        conn.execute(
            "INSERT OR IGNORE INTO reports (title, content, created_at) "
            "VALUES (?, ?, ?)",
            (title, json.dumps(summary, indent=2), ts),
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"(could not save to reports.db: {e})", file=sys.stderr)


def show_history() -> None:
    if not DB_PATH.exists():
        print("No reports.db found.")
        return
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute(
        "SELECT title, created_at FROM reports "
        "WHERE title LIKE 'Style Quality Snapshot%' "
        "ORDER BY created_at DESC LIMIT 20"
    ).fetchall()
    conn.close()
    if not rows:
        print("No snapshots recorded yet.")
        return
    print("\nStyle quality history (last 20 runs):")
    for title, ts in rows:
        print(f"  {ts[:16]}  {title}")
    print()


def main():
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("frontends", nargs="*",
                        help="Which frontends to check (default: all)")
    parser.add_argument("--json",    action="store_true")
    parser.add_argument("--save",    action="store_true",
                        help="Save snapshot to txt/reports.db")
    parser.add_argument("--history", action="store_true")
    parser.add_argument("--fail-below", type=float, default=0,
                        help="Exit 1 if any frontend overall score < N")
    args = parser.parse_args()

    if args.history:
        show_history()
        return

    targets = args.frontends if args.frontends else FRONTENDS
    targets = [t.rstrip("/").split("/")[-1] for t in targets]

    results = [scan_frontend(name) for name in targets]

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        print_report(results)

    if args.save:
        save_snapshot(results)
        print("Snapshot saved to reports.db.")

    if args.fail_below:
        failed = [
            r for r in results
            if "error" not in r and r["overall"] < args.fail_below
        ]
        if failed:
            names = ", ".join(r["frontend"] for r in failed)
            print(
                f"Style quality FAILED for: {names} "
                f"(below {args.fail_below:.0f})",
                file=sys.stderr,
            )
            sys.exit(1)


if __name__ == "__main__":
    main()
