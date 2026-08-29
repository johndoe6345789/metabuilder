#!/usr/bin/env python3
"""
Track refactor compliance across all frontends.

Rules enforced:
  - Component/hook files: 50-100 LOC (hard max 100)
  - Line width: <=80 chars (warn if >10% of lines exceed)
  - State logic extracted: no useState/useEffect in .tsx component files
    (exempt: files in hooks/ subdirectory)
  - Hooks co-located: hooks/ subfolder exists alongside components that
    need state (heuristic: .tsx files with >0 state lines should have a hooks/ sibling)

Usage:
  python3 scripts/refactor-coverage.py              # all frontends
  python3 scripts/refactor-coverage.py postgres     # one frontend
  python3 scripts/refactor-coverage.py --json       # machine-readable output
  python3 scripts/refactor-coverage.py --history    # show trend from SQLite
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

# The 2026-08-11 reposplit moved every frontend except these two out to
# sibling repos, and `cli` is C++ -- so `nextjs` is the only one this script
# can measure from inside metabuilder. The old list silently reported
# "src/ not found" six times and a compliance score of nothing at all.
FRONTENDS = ["nextjs"]

SKIP_DIRS = {
    "node_modules", ".next", "coverage", "__pycache__",
    ".storybook", "dist", "out", ".turbo",
}
SKIP_FILES = {
    "next.config.ts", "next.config.js", "next.config.mjs",
    "tailwind.config.ts", "postcss.config.js", "jest.config.ts",
    "jest.config.cjs", "vitest.config.ts", "vitest.config.mts",
    "playwright.config.ts",
}

# 80, matching the project rule in CLAUDE.md ("Atomic components <=80 LOC").
# This read 100, so a 96-line file scored as compliant against a standard it
# did not meet.
LOC_WARN = 80         # files above this are non-compliant
LOC_MIN  = 20         # below this is a helper, not a smell
LINE_WIDTH = 80       # max line width
LINE_WIDTH_PCT = 0.10 # >10% of lines over limit = wide-line violation

STATE_HOOKS = re.compile(r'\b(useState|useEffect|useCallback|useRef|useReducer)\s*[(<(]')
HOOK_FILE   = re.compile(r'^use[A-Z]')   # files starting with "use" + capital


def count_lines(path: Path) -> tuple[int, int, int]:
    """Return (total_lines, wide_lines, state_hook_count)."""
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return 0, 0, 0
    lines = text.splitlines()
    wide = sum(1 for l in lines if len(l) > LINE_WIDTH)
    hooks = len(STATE_HOOKS.findall(text))
    return len(lines), wide, hooks


def is_config_or_test(path: Path) -> bool:
    if path.name in SKIP_FILES:
        return True
    suffixes = {".test.ts", ".test.tsx", ".spec.ts", ".spec.tsx"}
    return any(path.name.endswith(s) for s in suffixes)


def is_hook_file(path: Path) -> bool:
    return HOOK_FILE.match(path.stem) is not None


def scan_frontend(name: str) -> dict:
    base = FRONTENDS_DIR / name / "src"
    if not base.exists():
        base = FRONTENDS_DIR / name  # fallback
    if not base.exists():
        return {"frontend": name, "error": "src/ not found"}

    files_info = []
    for path in sorted(base.rglob("*.ts")) + sorted(base.rglob("*.tsx")):
        # skip excluded dirs
        parts = set(path.relative_to(base).parts[:-1])
        if parts & SKIP_DIRS:
            continue
        if is_config_or_test(path):
            continue

        loc, wide, state_count = count_lines(path)
        rel = str(path.relative_to(FRONTENDS_DIR / name))
        in_hooks_dir = "hooks" in path.parts

        violation_loc    = loc > LOC_WARN
        violation_wide   = (wide / max(loc, 1)) > LINE_WIDTH_PCT
        # State hook usage in a .tsx that is NOT in a hooks/ dir is a violation
        violation_state  = (
            path.suffix == ".tsx"
            and not in_hooks_dir
            and state_count > 0
        )
        compliant = not (violation_loc or violation_wide or violation_state)

        files_info.append({
            "file": rel,
            "loc": loc,
            "wide_lines": wide,
            "state_hooks": state_count,
            "in_hooks_dir": in_hooks_dir,
            "violation_loc": violation_loc,
            "violation_wide": violation_wide,
            "violation_state": violation_state,
            "compliant": compliant,
        })

    total = len(files_info)
    if total == 0:
        return {"frontend": name, "total": 0, "compliant": 0, "pct": 100.0, "files": []}

    compliant = sum(1 for f in files_info if f["compliant"])
    pct = round(100.0 * compliant / total, 1)

    violations_loc   = [f for f in files_info if f["violation_loc"]]
    violations_wide  = [f for f in files_info if f["violation_wide"]]
    violations_state = [f for f in files_info if f["violation_state"]]

    return {
        "frontend": name,
        "total": total,
        "compliant": compliant,
        "pct": pct,
        "violations": {
            "loc":   sorted(violations_loc,   key=lambda f: -f["loc"])[:20],
            "wide":  sorted(violations_wide,  key=lambda f: -f["wide_lines"])[:10],
            "state": sorted(violations_state, key=lambda f: -f["state_hooks"])[:10],
        },
        "files": files_info,
    }


def print_report(results: list[dict]) -> None:
    RESET  = "\033[0m"
    RED    = "\033[31m"
    YELLOW = "\033[33m"
    GREEN  = "\033[32m"
    BOLD   = "\033[1m"

    def colour(pct):
        if pct >= 90: return GREEN
        if pct >= 70: return YELLOW
        return RED

    print(f"\n{BOLD}Refactor Compliance Report — {datetime.now():%Y-%m-%d %H:%M}{RESET}")
    print("=" * 70)

    overall_total = 0
    overall_compliant = 0

    for r in results:
        if "error" in r:
            print(f"  {r['frontend']:20s}  ERROR: {r['error']}")
            continue
        pct = r["pct"]
        c = colour(pct)
        bar_filled = int(pct / 5)
        bar = "█" * bar_filled + "░" * (20 - bar_filled)
        status = "✓" if pct >= 80 else "✗"
        print(f"  {r['frontend']:20s}  [{bar}] {c}{pct:5.1f}%{RESET}  "
              f"{r['compliant']}/{r['total']} files  {c}{status}{RESET}")
        overall_total += r["total"]
        overall_compliant += r["compliant"]

    if overall_total:
        overall_pct = round(100.0 * overall_compliant / overall_total, 1)
        c = colour(overall_pct)
        print("-" * 70)
        print(f"  {'TOTAL':20s}  {c}{overall_pct:.1f}%{RESET}  "
              f"{overall_compliant}/{overall_total} files")

        # The ratio is a poor scoreboard for splitting work: dividing one
        # oversized file into fifteen compliant ones adds fifteen to the
        # denominator, so the percentage barely moves even though the codebase
        # improved. These absolute counts fall by one per file actually fixed.
        allf = [f for r in results if "error" not in r for f in r["files"]]
        over = sum(1 for f in allf if f["violation_loc"])
        wide = sum(1 for f in allf if f["violation_wide"])
        state = sum(1 for f in allf if f["violation_state"])
        print(f"  {'':20s}  over {LOC_WARN} LOC: {over}   "
              f"wide lines: {wide}   state-in-component: {state}")

    print()

    for r in results:
        if "error" in r or not any(
            r["violations"][k] for k in ("loc", "wide", "state")
        ):
            continue
        if not any(r["violations"][k] for k in ("loc", "wide", "state")):
            continue

        print(f"{BOLD}{r['frontend']}{RESET} violations:")

        if r["violations"]["loc"]:
            print(f"  {RED}Over {LOC_WARN} LOC:{RESET}")
            for f in r["violations"]["loc"][:10]:
                print(f"    {f['loc']:4d} lines  {f['file']}")

        if r["violations"]["state"]:
            print(f"  {YELLOW}State hooks in component (.tsx) — extract to hooks/:{RESET}")
            for f in r["violations"]["state"][:8]:
                print(f"    {f['state_hooks']:2d} hooks  {f['file']}")

        if r["violations"]["wide"]:
            print(f"  {YELLOW}>10% lines over 80 chars:{RESET}")
            for f in r["violations"]["wide"][:5]:
                pct = round(100.0 * f["wide_lines"] / max(f["loc"], 1))
                print(f"    {pct:3d}% wide  {f['file']}")
        print()


def save_snapshot(results: list[dict]) -> None:
    """Append a snapshot row to txt/reports.db if it exists."""
    if not DB_PATH.exists():
        return
    try:
        conn = sqlite3.connect(DB_PATH)
        ts = datetime.now().isoformat()
        summary = {
            r["frontend"]: {
                "pct": r.get("pct"),
                "compliant": r.get("compliant"),
                "total": r.get("total"),
            }
            for r in results if "error" not in r
        }
        content = json.dumps(summary, indent=2)
        overall_total = sum(r.get("total", 0) for r in results if "error" not in r)
        overall_compliant = sum(r.get("compliant", 0) for r in results if "error" not in r)
        overall_pct = round(100.0 * overall_compliant / max(overall_total, 1), 1)
        title = f"Refactor Coverage Snapshot {ts[:10]} — {overall_pct:.1f}% overall"
        conn.execute(
            "INSERT OR IGNORE INTO reports (title, content, created_at) "
            "VALUES (?, ?, ?)",
            (title, content, ts),
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
        "WHERE title LIKE 'Refactor Coverage Snapshot%' "
        "ORDER BY created_at DESC LIMIT 20"
    ).fetchall()
    conn.close()
    if not rows:
        print("No snapshots recorded yet.")
        return
    print("\nRefactor coverage history (last 20 runs):")
    for title, ts in rows:
        print(f"  {ts[:16]}  {title}")
    print()


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("frontends", nargs="*",
                        help="Which frontends to check (default: all)")
    parser.add_argument("--json", action="store_true",
                        help="Output JSON instead of human-readable report")
    parser.add_argument("--history", action="store_true",
                        help="Show snapshot history from reports.db")
    parser.add_argument("--save", action="store_true",
                        help="Save a snapshot to txt/reports.db")
    parser.add_argument("--fail-below", type=float, default=0,
                        help="Exit code 1 if overall file-level pct below this (for CI)")
    parser.add_argument("--gate", type=float, default=0,
                        help="Exit 1 if fewer than GATE%% of frontends reach --fail-below "
                             "(e.g. --fail-below 80 --gate 80 = 80%% of frontends must "
                             "have 80%% compliant files)")
    args = parser.parse_args()

    if args.history:
        show_history()
        return

    targets = args.frontends if args.frontends else FRONTENDS
    # normalise names (strip leading path if passed as frontends/postgres)
    targets = [t.rstrip("/").split("/")[-1] for t in targets]

    results = [scan_frontend(name) for name in targets]

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        print_report(results)

    if args.save:
        save_snapshot(results)
        print("Snapshot saved to reports.db.")

    if args.fail_below or args.gate:
        valid = [r for r in results if "error" not in r]

        if args.gate and args.fail_below:
            # Gate: X% of frontends must each have Y% compliant files
            passing = [r for r in valid if r["pct"] >= args.fail_below]
            pct_frontends = 100.0 * len(passing) / max(len(valid), 1)
            if not args.json:
                print(f"Frontends >= {args.fail_below:.0f}%: "
                      f"{len(passing)}/{len(valid)} ({pct_frontends:.1f}%)")
                print(f"Gate requires: {args.gate:.0f}% of frontends")
            if pct_frontends < args.gate:
                if not args.json:
                    print(f"GATE FAILED: {pct_frontends:.1f}% < {args.gate:.0f}%")
                sys.exit(1)
            if not args.json:
                print(f"GATE PASSED: {pct_frontends:.1f}% >= {args.gate:.0f}%")
        elif args.fail_below:
            # Legacy: fail if overall file-level pct is below threshold
            overall_total = sum(r["total"] for r in valid)
            overall_compliant = sum(r["compliant"] for r in valid)
            overall_pct = 100.0 * overall_compliant / max(overall_total, 1)
            if overall_pct < args.fail_below:
                sys.exit(1)


if __name__ == "__main__":
    main()
