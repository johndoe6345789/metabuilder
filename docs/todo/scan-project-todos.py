#!/usr/bin/env python3

from __future__ import annotations

import re
import subprocess
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path


@dataclass(frozen=True)
class TodoMatch:
    path: str
    line: int
    text: str


PATTERN = r"\b(TODO|FIXME|HACK|XXX)\b"
RG_GLOBS = [
    "!docs/todo/**",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
    "!**/dist/**",
    "!**/build/**",
    "!**/.git/**",
]


def _repo_root(script_dir: Path) -> Path:
    # docs/todo -> docs -> repo root
    return script_dir.parent.parent


def _run_rg(repo_root: Path) -> list[TodoMatch]:
    cmd = ["rg", "-n", "-S", PATTERN]
    for glob in RG_GLOBS:
        cmd.extend(["--glob", glob])
    cmd.append(".")

    completed = subprocess.run(
        cmd,
        cwd=repo_root,
        text=True,
        capture_output=True,
        check=False,
    )

    if completed.returncode not in (0, 1):
        raise RuntimeError(
            "ripgrep failed\n"
            f"cmd: {' '.join(cmd)}\n"
            f"exit: {completed.returncode}\n"
            f"stderr:\n{completed.stderr}"
        )

    matches: list[TodoMatch] = []
    for raw_line in completed.stdout.splitlines():
        # Format: path:line:text (text itself may contain ':', so split max 2)
        file_part, sep1, rest = raw_line.partition(":")
        if not sep1:
            continue
        line_part, sep2, text_part = rest.partition(":")
        if not sep2:
            continue
        try:
            line_no = int(line_part)
        except ValueError:
            continue
        matches.append(
            TodoMatch(
                path=file_part.removeprefix("./"),
                line=line_no,
                text=text_part.rstrip(),
            )
        )
    return matches


def _top_level_dir(path: str) -> str:
    if not path:
        return "(root)"
    if path.startswith(".github/"):
        return ".github"
    return path.split("/", 1)[0]


def _marker_counts(matches: list[TodoMatch]) -> Counter[str]:
    counts: Counter[str] = Counter()
    marker_re = re.compile(PATTERN, re.IGNORECASE)
    for match in matches:
        found = marker_re.search(match.text)
        if not found:
            continue
        counts[found.group(1).upper()] += 1
    return counts


def _render_scan_report(
    repo_root: Path, out_path: Path, matches: list[TodoMatch]
) -> None:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%SZ")
    report_dir = out_path.parent
    report_dir_display = str(report_dir.relative_to(repo_root))

    by_dir: dict[str, list[TodoMatch]] = defaultdict(list)
    for match in matches:
        by_dir[_top_level_dir(match.path)].append(match)

    dir_counts = Counter({k: len(v) for k, v in by_dir.items()})
    marker_counts = _marker_counts(matches)

    lines: list[str] = []
    lines.append("# TODO Scan Report")
    lines.append("")
    lines.append(f"- Generated: `{now}` (UTC)")
    lines.append(f"- Report directory: `{report_dir_display}`")
    lines.append(f"- Pattern: `{PATTERN}`")
    lines.append(
        "- Excludes: `docs/todo/`, `**/node_modules/`, `**/.next/`, `**/coverage/`, `**/dist/`, `**/build/`, `**/.git/`"
    )
    lines.append("")
    lines.append("## Summary")
    lines.append(f"- Total matches: **{len(matches)}**")
    if marker_counts:
        lines.append(
            "- By marker: "
            + ", ".join(
                f"`{marker}`={marker_counts[marker]}"
                for marker in sorted(marker_counts.keys())
            )
        )
    lines.append("- By top-level directory:")
    for directory in sorted(dir_counts.keys()):
        lines.append(f"  - `{directory}`: {dir_counts[directory]}")

    lines.append("")
    lines.append("## Matches")
    for directory in sorted(by_dir.keys()):
        lines.append("")
        lines.append(f"### `{directory}` ({len(by_dir[directory])})")
        for match in sorted(by_dir[directory], key=lambda m: (m.path, m.line)):
            snippet = re.sub(r"\s+", " ", match.text).strip()
            if len(snippet) > 180:
                snippet = snippet[:177] + "..."
            lines.append(f"- `{match.path}:{match.line}` — {snippet}")

    out_path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def _render_todo_status(todo_dir: Path, out_path: Path) -> None:
    md_files = sorted(
        p for p in todo_dir.glob("*.md") if p.name not in {"TODO_SCAN_REPORT.md", "TODO_STATUS.md"}
    )

    checkbox_open_re = re.compile(r"^\s*-\s*\[\s*\]\s+")
    checkbox_done_re = re.compile(r"^\s*-\s*\[\s*x\s*\]\s+", re.IGNORECASE)

    rows: list[tuple[str, int, int, int]] = []
    total_open = 0
    total_done = 0
    for path in md_files:
        open_count = 0
        done_count = 0
        for line in path.read_text(encoding="utf-8").splitlines():
            if checkbox_done_re.match(line):
                done_count += 1
            elif checkbox_open_re.match(line):
                open_count += 1
        total_open += open_count
        total_done += done_count
        rows.append((path.name, open_count, done_count, open_count + done_count))

    lines: list[str] = []
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%SZ")
    lines.append("# TODO List Status")
    lines.append("")
    lines.append(f"- Generated: `{now}` (UTC)")
    try:
        directory_display = str(todo_dir.relative_to(_repo_root(todo_dir)))
    except ValueError:
        directory_display = str(todo_dir)
    lines.append(f"- Directory: `{directory_display}`")
    lines.append(f"- Total items: **{total_open + total_done}** (`open`={total_open}, `done`={total_done})")
    lines.append("")
    lines.append("| File | Open | Done | Total |")
    lines.append("|------|-----:|-----:|------:|")
    for filename, open_count, done_count, total in rows:
        lines.append(f"| `{filename}` | {open_count} | {done_count} | {total} |")

    out_path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def main() -> None:
    script_path = Path(__file__).resolve()
    todo_dir = script_path.parent
    repo_root = _repo_root(todo_dir)

    matches = _run_rg(repo_root)
    _render_scan_report(repo_root, todo_dir / "TODO_SCAN_REPORT.md", matches)
    _render_todo_status(todo_dir, todo_dir / "TODO_STATUS.md")

    print(f"Wrote: {todo_dir / 'TODO_SCAN_REPORT.md'}")
    print(f"Wrote: {todo_dir / 'TODO_STATUS.md'}")


if __name__ == "__main__":
    main()
