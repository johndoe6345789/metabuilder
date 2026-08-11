#!/usr/bin/env python3
"""Reassemble the MetaBuilder dev workspace from its sibling micro-repos.

MetaBuilder was split into many single-purpose repos (see the reposplit repo).
This repo now holds only three frontends, but their build configuration still
assumes the old monorepo layout:

  * the root package.json declares npm workspaces under libraries/*
  * frontends/qt6/CMakeLists.txt references ../../libraries/qml/*
  * frontends/nextjs/scripts/compile-tokens.mjs reads packages/*/styles/tokens.json

This script clones the sibling repos named in .github/workspace.json and mounts
them at the paths that build configuration expects, so a checkout of this repo
alone can be built and tested.

Typical use:

    # Everything the Next.js frontend needs, pinned to workspace.json
    python3 .github/scripts/assemble_workspace.py --frontend nextjs

    # Just the QML sources for the Qt6 frontend
    python3 .github/scripts/assemble_workspace.py --frontend qt6

    # Ignore the pins and take each repo's current branch head
    python3 .github/scripts/assemble_workspace.py --frontend nextjs --floating

    # See what would happen, without touching the filesystem
    python3 .github/scripts/assemble_workspace.py --all --dry-run

Private sibling repos need a token with read access to them. A workflow's
default GITHUB_TOKEN is scoped to the current repo only, so pass a PAT via
--token or the WORKSPACE_TOKEN environment variable in that case.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
MANIFEST = REPO_ROOT / ".github" / "workspace.json"


class AssemblyError(RuntimeError):
    """A mount could not be produced; the workspace is not usable as-is."""


# --------------------------------------------------------------------------
# manifest
# --------------------------------------------------------------------------

def load_manifest(path: Path) -> dict:
    """Read workspace.json, ignoring the _comment/_note documentation keys."""
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise AssemblyError(f"manifest not found: {path}")
    except json.JSONDecodeError as exc:
        raise AssemblyError(f"manifest is not valid JSON: {path}: {exc}")

    if not data.get("repos"):
        raise AssemblyError(f"manifest declares no repos: {path}")
    return data


def select_repos(manifest: dict, frontend: str | None) -> list[dict]:
    """Return the manifest entries needed for one frontend, or all of them.

    Filtering matters for build time: the Qt6 job has no use for the npm
    libraries, and the CLI needs nothing at all.
    """
    repos = manifest["repos"]
    if frontend is None:
        return repos
    return [r for r in repos if frontend in r.get("needed_by", [])]


# --------------------------------------------------------------------------
# git
# --------------------------------------------------------------------------

def run_git(args: list[str], cwd: Path | None = None) -> subprocess.CompletedProcess:
    """Run a git command, raising AssemblyError with stderr on failure."""
    proc = subprocess.run(
        ["git", *args],
        cwd=cwd,
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        raise AssemblyError(
            f"git {' '.join(args)} failed ({proc.returncode}):\n{proc.stderr.strip()}"
        )
    return proc


def clone_url(owner: str, repo: str, token: str | None) -> str:
    if token:
        return f"https://x-access-token:{token}@github.com/{owner}/{repo}.git"
    return f"https://github.com/{owner}/{repo}.git"


def fetch_repo(url: str, ref: str, dest: Path, display_url: str) -> None:
    """Shallow-fetch a single ref (commit SHA or branch) into dest.

    A plain `git clone --depth 1` cannot target an arbitrary commit, so this
    does init + fetch instead, which works for both SHAs and branch names.
    """
    dest.mkdir(parents=True, exist_ok=True)
    run_git(["init", "--quiet"], cwd=dest)
    run_git(["remote", "add", "origin", url], cwd=dest)
    try:
        run_git(["fetch", "--depth", "1", "--quiet", "origin", ref], cwd=dest)
    except AssemblyError as exc:
        raise AssemblyError(
            f"could not fetch {ref} from {display_url}: {exc}"
        ) from exc
    run_git(["checkout", "--quiet", "FETCH_HEAD"], cwd=dest)


def handle_missing_ref(entry: dict, error: AssemblyError) -> str:
    """Decide what to do when a repo's pinned SHA can no longer be fetched.

    This happens when a sibling repo is force-pushed or its history rewritten:
    the SHA recorded in workspace.json stops existing, and every metabuilder
    build that depends on it starts failing at checkout time.

    Return the ref to retry with, or raise to fail the build.

    TODO(contribution): choose the policy for this project. The trade-off:

      * Hard-fail (current behaviour) keeps builds honest and reproducible -
        you always know exactly what was built - but one force-push in any of
        the sibling repos bricks CI here until someone bumps the pin by hand.

      * Falling back to entry["branch"] with a loud warning keeps CI moving,
        but the build silently stops being reproducible, and the pin in
        workspace.json becomes a comfortable lie.

      * A middle path: fall back on pull_request runs (where a red build is
        just noise) but hard-fail on main (where reproducibility is the point).
        os.environ.get("GITHUB_EVENT_NAME") tells you which you are in.
    """
    raise AssemblyError(
        f"{entry['repo']}: pinned ref {entry['ref']} could not be fetched. "
        f"It may have been force-pushed away. Re-run the bump-workspace-pins "
        f"workflow, or re-run this script with --floating.\n  {error}"
    )


# --------------------------------------------------------------------------
# mounting
# --------------------------------------------------------------------------

def place_mount(
    source_root: Path,
    mount: dict,
    dest_root: Path,
    force: bool,
    *,
    keep_source: bool,
) -> Path:
    """Put one 'from' path of a fetched repo at its 'to' path.

    A repo may declare several mounts, because the app's own configuration is
    inconsistent about where things live - next.config.ts and tsconfig.json
    disagree on the same alias in a couple of places. keep_source copies rather
    than moves, so the fetched tree survives for the remaining mounts.
    """
    src = source_root / mount["from"] if mount["from"] != "." else source_root
    dst = dest_root / mount["to"]

    if not src.exists():
        raise AssemblyError(
            f"mount source {mount['from']!r} does not exist in the fetched repo"
        )

    if dst.exists():
        if not force:
            raise AssemblyError(
                f"{mount['to']} already exists. Pass --force to replace it."
            )
        shutil.rmtree(dst)

    dst.parent.mkdir(parents=True, exist_ok=True)
    # Drop the mounted repo's own .git so the outer repo does not see a
    # nested repository (which git would otherwise treat as a submodule).
    if mount["from"] == ".":
        shutil.rmtree(src / ".git", ignore_errors=True)

    if keep_source:
        shutil.copytree(src, dst, symlinks=True)
    else:
        shutil.move(str(src), str(dst))
    return dst


def assemble(
    manifest: dict,
    repos: list[dict],
    dest_root: Path,
    *,
    token: str | None,
    floating: bool,
    force: bool,
    dry_run: bool,
) -> list[Path]:
    """Fetch and mount every selected repo. Returns the mounted paths."""
    owner = manifest.get("owner")
    if not owner:
        raise AssemblyError("manifest has no 'owner'")

    mounted: list[Path] = []

    for entry in repos:
        name = entry["repo"]
        ref = entry["branch"] if floating else entry["ref"]
        targets = ", ".join(m["to"] for m in entry["mounts"])
        print(f"==> {name}@{ref[:12]} -> {targets}", flush=True)

        if dry_run:
            mounted.extend(dest_root / m["to"] for m in entry["mounts"])
            continue

        url = clone_url(owner, name, token)
        display = f"{owner}/{name}"

        with tempfile.TemporaryDirectory(prefix=f"mb-{name}-") as tmp:
            work = Path(tmp) / "src"
            try:
                fetch_repo(url, ref, work, display)
            except AssemblyError as exc:
                if floating:
                    raise
                retry_ref = handle_missing_ref(entry, exc)
                shutil.rmtree(work, ignore_errors=True)
                fetch_repo(url, retry_ref, work, display)

            # The last mount may consume the fetched tree; earlier ones copy.
            last = len(entry["mounts"]) - 1
            for index, mount in enumerate(entry["mounts"]):
                path = place_mount(
                    work, mount, dest_root, force, keep_source=index != last
                )
                mounted.append(path)
                print(f"    {mount['to']}", flush=True)

    return mounted


def verify_mounts(paths: list[Path]) -> None:
    """Fail loudly if a mount landed empty.

    Worth doing explicitly, because the things that consume these mounts fail
    quietly rather than loudly. compile-tokens.mjs, for instance, writes an
    empty stub and exits 0 when packages/ is missing, so a broken mount would
    otherwise surface as a styled-wrong app rather than a failed build.
    """
    empty = [p for p in paths if not p.exists() or not any(p.iterdir())]
    if empty:
        listing = "\n".join(f"  - {p}" for p in empty)
        raise AssemblyError(f"these mounts are missing or empty:\n{listing}")


# --------------------------------------------------------------------------
# entry point
# --------------------------------------------------------------------------

def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    target = parser.add_mutually_exclusive_group(required=True)
    target.add_argument(
        "--frontend",
        choices=["nextjs", "qt6", "cli"],
        help="Mount only what this frontend needs.",
    )
    target.add_argument(
        "--all",
        action="store_true",
        help="Mount every repo in the manifest.",
    )
    parser.add_argument(
        "--manifest",
        type=Path,
        default=MANIFEST,
        help="Path to workspace.json (default: .github/workspace.json).",
    )
    parser.add_argument(
        "--dest",
        type=Path,
        default=REPO_ROOT,
        help="Root to mount into (default: this repo's root).",
    )
    parser.add_argument(
        "--token",
        default=os.environ.get("WORKSPACE_TOKEN") or os.environ.get("GITHUB_TOKEN"),
        help="GitHub token for private repos. Defaults to $WORKSPACE_TOKEN, "
             "then $GITHUB_TOKEN.",
    )
    parser.add_argument(
        "--floating",
        action="store_true",
        help="Use each repo's branch head instead of its pinned SHA.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Replace mount paths that already exist.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the plan without fetching or writing anything.",
    )
    args = parser.parse_args()

    try:
        manifest = load_manifest(args.manifest)
        frontend = None if args.all else args.frontend
        repos = select_repos(manifest, frontend)

        if not repos:
            note = manifest.get("frontends", {}).get(frontend, {}).get("_note", "")
            print(f"Nothing to mount for {frontend}. {note}".rstrip())
            return 0

        mounted = assemble(
            manifest,
            repos,
            args.dest,
            token=args.token,
            floating=args.floating,
            force=args.force,
            dry_run=args.dry_run,
        )

        if not args.dry_run:
            verify_mounts(mounted)

        print(f"\nMounted {len(mounted)} path(s).")
        return 0

    except AssemblyError as exc:
        print(f"\nerror: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
