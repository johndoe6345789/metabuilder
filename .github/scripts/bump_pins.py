#!/usr/bin/env python3
"""Update the sibling-repo commit pins in .github/workspace.json.

The workspace manifest pins every sibling micro-repo to a commit SHA so that
CI here is reproducible and cannot be broken by someone else's push. The cost
of that is drift: without a way to move the pins, this repo slowly stops
testing against what the rest of the platform actually looks like.

This script resolves each repo's tracked branch to its current head and
rewrites the 'ref' fields. It is normally run by the bump-workspace-pins
workflow, which opens a pull request with the result.

    # Show what has moved, without writing
    python3 .github/scripts/bump_pins.py --check

    # Update all pins
    python3 .github/scripts/bump_pins.py

    # Update only some repos
    python3 .github/scripts/bump_pins.py --repo components --repo redux

Uses the GitHub REST API; set GITHUB_TOKEN (or pass --token) to raise the
unauthenticated rate limit and to reach private repos.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
MANIFEST = REPO_ROOT / ".github" / "workspace.json"

API = "https://api.github.com"


def resolve_head(owner: str, repo: str, branch: str, token: str | None) -> str:
    """Return the current head SHA of a branch via the GitHub API."""
    url = f"{API}/repos/{owner}/{repo}/commits/{branch}"
    request = urllib.request.Request(url)
    request.add_header("Accept", "application/vnd.github+json")
    request.add_header("User-Agent", "metabuilder-bump-pins")
    if token:
        request.add_header("Authorization", f"Bearer {token}")

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.load(response)["sha"]
    except urllib.error.HTTPError as exc:
        detail = "not found - check the repo name and branch" if exc.code == 404 else exc.reason
        raise RuntimeError(f"{owner}/{repo}@{branch}: HTTP {exc.code}: {detail}")
    except urllib.error.URLError as exc:
        raise RuntimeError(f"{owner}/{repo}@{branch}: {exc.reason}")


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--manifest",
        type=Path,
        default=MANIFEST,
        help="Path to workspace.json (default: .github/workspace.json).",
    )
    parser.add_argument(
        "--repo",
        action="append",
        dest="repos",
        help="Only bump this repo (repeatable). Default: all of them.",
    )
    parser.add_argument(
        "--token",
        default=os.environ.get("GITHUB_TOKEN"),
        help="GitHub token. Defaults to $GITHUB_TOKEN.",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Report which pins are behind and exit non-zero if any are, "
             "without modifying the manifest.",
    )
    args = parser.parse_args()

    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    owner = manifest["owner"]

    changed: list[str] = []
    failed: list[str] = []

    for entry in manifest["repos"]:
        name = entry["repo"]
        if args.repos and name not in args.repos:
            continue

        try:
            head = resolve_head(owner, name, entry["branch"], args.token)
        except RuntimeError as exc:
            print(f"  !  {exc}", file=sys.stderr)
            failed.append(name)
            continue

        if head == entry["ref"]:
            print(f"  =  {name} up to date ({head[:12]})")
            continue

        print(f"  ^  {name} {entry['ref'][:12]} -> {head[:12]}")
        changed.append(name)
        if not args.check:
            entry["ref"] = head

    if failed:
        print(f"\nfailed to resolve: {', '.join(failed)}", file=sys.stderr)
        return 1

    if not changed:
        print("\nAll pins up to date.")
        return 0

    if args.check:
        print(f"\n{len(changed)} pin(s) behind: {', '.join(changed)}")
        return 1

    # Trailing newline keeps the file POSIX-clean and the diff minimal.
    args.manifest.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"\nUpdated {len(changed)} pin(s): {', '.join(changed)}")

    # Surface the list to the calling workflow for the PR body.
    step_output = os.environ.get("GITHUB_OUTPUT")
    if step_output:
        with open(step_output, "a", encoding="utf-8") as handle:
            handle.write(f"changed={','.join(changed)}\n")
            handle.write(f"count={len(changed)}\n")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
