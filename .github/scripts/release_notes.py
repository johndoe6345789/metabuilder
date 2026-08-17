#!/usr/bin/env python3
"""Write the release notes for a Qt6 desktop build.

Every push to main produces a release, so these notes are read by people who
did not write the commits and mostly want to know whether this build is worth
downloading. The generator therefore leads with what changed in words, groups
related commits, and keeps the machine-readable detail (SHAs, checksums, build
inputs) below the fold.

Commit subjects are classified by their conventional-commit type where there is
one, and by leading verb where there is not -- this repo's history has plenty of
both.

Usage:

    python3 .github/scripts/release_notes.py \
        --repo owner/name \
        --tag qt6-v0.1.42 \
        --version 0.1.42 \
        --previous-tag qt6-v0.1.41 \
        --artifacts-dir dist \
        --output notes.md
"""

from __future__ import annotations

import argparse
import hashlib
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

# Order matters: it is the order sections appear in the notes.
SECTIONS = [
    ("feature", "New"),
    ("fix", "Fixed"),
    ("improvement", "Improved"),
    ("docs", "Documentation"),
    ("build", "Build and infrastructure"),
    ("other", "Other changes"),
]

CONVENTIONAL_TYPES = {
    "feat": "feature",
    "feature": "feature",
    "fix": "fix",
    "bugfix": "fix",
    "hotfix": "fix",
    "perf": "improvement",
    "refactor": "improvement",
    "style": "improvement",
    "chore": "build",
    "build": "build",
    "ci": "build",
    "test": "build",
    "docs": "docs",
    "doc": "docs",
}

# Fallback for the majority of commits, which are not conventional.
VERB_HINTS = [
    ("feature", ("add", "adds", "added", "introduce", "implement", "create", "support",
                 "wire", "enable", "expose", "ship")),
    ("fix", ("fix", "fixes", "fixed", "correct", "repair", "resolve", "prevent", "stop",
             "restore", "unbreak", "handle", "guard")),
    ("improvement", ("improve", "update", "refactor", "rename", "simplify", "clean",
                     "tidy", "speed", "optimise", "optimize", "reduce", "remove",
                     "drop", "delete", "split", "move", "switch", "bump", "upgrade",
                     "make", "align", "tune", "harden", "adopt", "use", "teach",
                     "keep", "let", "replace", "rework")),
    ("docs", ("document", "docs", "comment", "clarify", "explain", "note", "record",
              "claude.md", "readme")),
    ("build", ("ci", "workflow", "pipeline", "docker", "release", "package", "deploy",
               "jenkins", "publish")),
]

# Human names for the parts of the tree, used for the "what this touched" line.
AREA_NAMES = {
    "frontends/qt6": "the desktop app",
    "frontends/nextjs": "the web app",
    "frontends/cli": "the command-line tool",
    ".github": "the build pipeline",
    "libraries": "shared libraries",
    "packages": "feature packages",
    "deploy": "deployment",
}

DOWNLOADS = [
    ("linux-x86_64", "Linux", "Intel / AMD 64-bit", "most desktops and servers"),
    ("linux-arm64", "Linux", "ARM64", "Raspberry Pi 5, Ampere, ARM cloud VMs"),
    ("windows-x86_64", "Windows", "Intel / AMD 64-bit", "most PCs"),
    ("windows-arm64", "Windows", "ARM64", "Snapdragon / Copilot+ PCs"),
    ("macos-universal", "macOS", "Apple silicon + Intel", "one download for both"),
]


@dataclass
class Commit:
    sha: str
    subject: str
    body: str
    author: str


def git(*args: str) -> str:
    return subprocess.run(
        ["git", *args], capture_output=True, text=True, check=True
    ).stdout.strip()


def read_commits(previous_tag: str | None, sha: str) -> list[Commit]:
    """Commits included in this release, newest first."""
    span = f"{previous_tag}..{sha}" if previous_tag else sha
    # A record separator that cannot appear in a commit message.
    fmt = "%H%x1f%s%x1f%b%x1e"
    try:
        raw = git("log", "--no-merges", f"--format={fmt}", span)
    except subprocess.CalledProcessError:
        # The previous tag is not an ancestor (force-push, or a tag from a
        # branch that was rebased away). Describing one commit is more useful
        # than failing the release.
        raw = git("log", "--no-merges", f"--format={fmt}", "-1", sha)

    commits = []
    for record in raw.split("\x1e"):
        record = record.strip("\n")
        if not record:
            continue
        parts = record.split("\x1f")
        if len(parts) < 3:
            continue
        commits.append(
            Commit(sha=parts[0], subject=parts[1].strip(), body=parts[2].strip(), author="")
        )
    return commits


def classify(subject: str) -> tuple[str, str]:
    """Return (section, cleaned subject) for a commit subject."""
    match = re.match(r"^(\w+)(\([^)]*\))?!?:\s*(.+)$", subject)
    if match and match.group(1).lower() in CONVENTIONAL_TYPES:
        return CONVENTIONAL_TYPES[match.group(1).lower()], match.group(3).strip()

    first = re.split(r"[\s:,]", subject.strip().lower(), maxsplit=1)[0]
    for section, verbs in VERB_HINTS:
        if first in verbs:
            return section, subject
    return "other", subject


def humanise(subject: str) -> str:
    """Tidy a commit subject into something readable in a bulleted list."""
    text = subject.strip()
    # Trailing issue refs and squash-merge PR numbers read as noise in a list
    # aimed at users; the commit link below carries the same information.
    text = re.sub(r"\s*\(#\d+\)\s*$", "", text)
    text = text.rstrip(".")
    if text and text[0].islower() and not text.startswith(("iOS", "macOS")):
        text = text[0].upper() + text[1:]
    return text


def dedupe(items: list[tuple[str, str]]) -> list[tuple[str, str]]:
    """Drop repeated subjects, which frequent small commits produce a lot of."""
    seen: set[str] = set()
    result = []
    for text, sha in items:
        key = text.lower()
        if key in seen:
            continue
        seen.add(key)
        result.append((text, sha))
    return result


def changed_areas(previous_tag: str | None, sha: str) -> list[str]:
    """Friendly names for the parts of the tree this release touched."""
    span = f"{previous_tag}..{sha}" if previous_tag else f"{sha}~1..{sha}"
    try:
        files = git("diff", "--name-only", span).splitlines()
    except subprocess.CalledProcessError:
        return []

    areas = []
    for path in files:
        for prefix, name in AREA_NAMES.items():
            if path.startswith(prefix) and name not in areas:
                areas.append(name)
    return areas


def summary_line(commits: list[Commit], areas: list[str]) -> str:
    """One sentence answering 'is there anything in this build for me?'."""
    if not commits:
        return "A rebuild with no source changes since the previous release."

    count = len(commits)
    plural = "change" if count == 1 else "changes"
    if areas:
        if len(areas) == 1:
            where = areas[0]
        else:
            where = ", ".join(areas[:-1]) + f" and {areas[-1]}"
        return f"{count} {plural}, touching {where}."
    return f"{count} {plural} since the previous release."


def render_downloads(artifacts: dict[str, Path], version: str) -> list[str]:
    lines = [
        "## Download",
        "",
        "| Platform | Processor | File | |",
        "| --- | --- | --- | --- |",
    ]
    for target, platform_name, chip, hint in DOWNLOADS:
        path = artifacts.get(target)
        if not path:
            continue
        size = path.stat().st_size / (1024 * 1024)
        lines.append(
            f"| {platform_name} | {chip} | `{path.name}` ({size:.0f} MB) | {hint} |"
        )
    lines.append("")
    return lines


INSTALL_NOTES = """## Installing

**Windows** — unzip anywhere and run `bin\\metabuilder-qt6.exe`.
SmartScreen will offer *More info → Run anyway* the first time.

**macOS** — open the `.dmg` and drag the app to Applications. macOS will say it
cannot check the app for malicious software: right-click it and choose *Open*,
then confirm. That is once per install.

**Linux** — unpack the `.tar.gz` and run `./metabuilder-qt6`. Qt travels with
the archive; graphics drivers come from your system.

These builds are not signed with a paid Apple or Microsoft certificate, which
is the only reason for the warnings above.
"""


def render_checksums(artifacts: dict[str, Path]) -> list[str]:
    lines = ["<details>", "<summary>SHA-256 checksums</summary>", "", "```"]
    for _target, path in sorted(artifacts.items()):
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        lines.append(f"{digest}  {path.name}")
    lines += ["```", "", "</details>", ""]
    return lines


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", required=True, help="owner/name")
    parser.add_argument("--tag", required=True)
    parser.add_argument("--version", required=True)
    parser.add_argument("--previous-tag", default="")
    parser.add_argument("--sha", default="HEAD")
    parser.add_argument("--artifacts-dir", type=Path)
    parser.add_argument("--qt-version", default="")
    parser.add_argument("--qml-ref", default="", help="SHA of the QML sibling repo used")
    parser.add_argument("--output", type=Path)
    parser.add_argument("--max-entries", type=int, default=40)
    args = parser.parse_args()

    previous = args.previous_tag or None
    commits = read_commits(previous, args.sha)
    areas = changed_areas(previous, args.sha)

    grouped: dict[str, list[tuple[str, str]]] = {key: [] for key, _ in SECTIONS}
    for commit in commits:
        section, subject = classify(commit.subject)
        grouped[section].append((humanise(subject), commit.sha))

    lines: list[str] = []
    lines.append(f"### {summary_line(commits, areas)}")
    lines.append("")

    shown = 0
    for key, heading in SECTIONS:
        entries = dedupe(grouped[key])
        if not entries:
            continue
        lines.append(f"#### {heading}")
        for text, sha in entries:
            if shown >= args.max_entries:
                break
            lines.append(
                f"- {text} "
                f"([`{sha[:7]}`](https://github.com/{args.repo}/commit/{sha}))"
            )
            shown += 1
        lines.append("")
        if shown >= args.max_entries:
            break

    remaining = len(commits) - shown
    if remaining > 0:
        lines.append(f"…and {remaining} more commit(s) — see the full changelog below.")
        lines.append("")

    artifacts: dict[str, Path] = {}
    if args.artifacts_dir and args.artifacts_dir.is_dir():
        for path in sorted(args.artifacts_dir.rglob("*")):
            if path.suffix.lower() not in {".gz", ".zip", ".dmg"}:
                continue
            for target, *_ in DOWNLOADS:
                if target in path.name:
                    artifacts[target] = path

    missing = [t for t, *_ in DOWNLOADS if t not in artifacts]
    if artifacts:
        lines += render_downloads(artifacts, args.version)
    if missing:
        lines.append(
            "> [!NOTE]\n"
            "> No build was produced for: "
            + ", ".join(f"`{t}`" for t in missing)
            + ". Earlier releases carry those platforms."
        )
        lines.append("")

    lines.append(INSTALL_NOTES)

    lines.append("<details>")
    lines.append("<summary>Build details</summary>")
    lines.append("")
    lines.append(f"- Commit: [`{args.sha[:7]}`](https://github.com/{args.repo}/commit/{args.sha})")
    if args.qt_version:
        lines.append(f"- Qt: {args.qt_version}")
    if args.qml_ref:
        lines.append(
            "- QML components: "
            f"[`{args.qml_ref[:7]}`](https://github.com/johndoe6345789/CPlusPlusQT6Skel/commit/{args.qml_ref})"
        )
    lines.append("")
    lines.append("</details>")
    lines.append("")

    if artifacts:
        lines += render_checksums(artifacts)

    if previous:
        lines.append(
            f"**Full changelog**: "
            f"https://github.com/{args.repo}/compare/{previous}...{args.tag}"
        )

    text = "\n".join(lines) + "\n"
    if args.output:
        args.output.write_text(text, encoding="utf-8")
        print(f"wrote {args.output} ({len(text)} bytes)")
    else:
        print(text)
    return 0


if __name__ == "__main__":
    sys.exit(main())
