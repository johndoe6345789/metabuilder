#!/usr/bin/env python3
"""
ai-commit.py — Generate a git commit message using Claude.

Usage:
  python3 scripts/ai-commit.py          # stage diff → Claude → confirm → commit
  python3 scripts/ai-commit.py --dry    # print message only, don't commit
  python3 scripts/ai-commit.py --all    # git add -A first
  python3 scripts/ai-commit.py --push   # commit then git push

Set up as a git alias:
  git config alias.ai '!python3 scripts/ai-commit.py'
  → git ai
  → git ai --push
"""

import subprocess
import sys
import os
import argparse

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

MAX_DIFF_CHARS = 40_000            # Truncate huge diffs to avoid token limits
CO_AUTHOR = "Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"

SYSTEM_PROMPT = """You are an expert at writing git commit messages.
Generate a single concise commit message for the staged changes.

Rules:
- First line: imperative mood, max 72 chars (e.g. "Add retry logic to Docker image pulls")
- Optionally add a blank line then 2-4 bullet points for significant changes
- No fluff, no "this commit", no AI disclaimers
- Focus on WHAT changed and WHY, not HOW
- Be specific — name the files/components changed if relevant
- Use conventional prefixes where natural: Add, Fix, Update, Remove, Refactor, Implement

Return ONLY the commit message text. No preamble, no quotes around it."""


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def run(cmd, check=True, capture=True):
    result = subprocess.run(
        cmd, shell=True, check=check,
        stdout=subprocess.PIPE if capture else None,
        stderr=subprocess.PIPE if capture else None,
        text=True
    )
    return result.stdout.strip() if capture else result.returncode


def get_diff():
    diff = run("git diff --staged")
    if not diff:
        print("Nothing staged. Use 'git add' first, or pass --all to stage everything.")
        sys.exit(0)
    if len(diff) > MAX_DIFF_CHARS:
        diff = diff[:MAX_DIFF_CHARS] + f"\n\n[diff truncated at {MAX_DIFF_CHARS} chars]"
    return diff


def get_context():
    """Extra context: list of staged files and recent commits."""
    files = run("git diff --staged --name-only")
    recent = run("git log --oneline -5 2>/dev/null || echo ''")
    return f"Staged files:\n{files}\n\nRecent commits:\n{recent}"


def generate_message(diff: str, context: str) -> str:
    prompt = f"{SYSTEM_PROMPT}\n\n{context}\n\n---\n\nDiff:\n{diff}"

    print("Calling Claude...", end=" ", flush=True)
    result = subprocess.run(
        ["claude", "-p", prompt],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    print("done.")

    if result.returncode != 0:
        print("claude CLI error:", result.stderr.strip())
        sys.exit(1)

    return result.stdout.strip()


def confirm_or_edit(msg: str):
    """Show message, let user confirm / edit / abort."""
    print()
    print("─" * 60)
    print(msg)
    print("─" * 60)
    print()
    print("[y] Commit  [e] Edit  [r] Regenerate  [n] Abort", end="  → ")
    choice = input().strip().lower()

    if choice == "y" or choice == "":
        return msg
    elif choice == "e":
        # Open in $EDITOR
        import tempfile
        editor = os.environ.get("EDITOR", "nano")
        with tempfile.NamedTemporaryFile(suffix=".txt", mode="w", delete=False) as f:
            f.write(msg)
            tmp = f.name
        subprocess.run(f"{editor} {tmp}", shell=True)
        with open(tmp) as f:
            edited = f.read().strip()
        os.unlink(tmp)
        return edited if edited else None
    elif choice == "r":
        return None  # caller will regenerate
    else:
        print("Aborted.")
        sys.exit(0)


def do_commit(msg: str, push: bool):
    full_msg = f"{msg}\n\n{CO_AUTHOR}"
    # Write to temp file to avoid shell escaping issues
    import tempfile
    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
        f.write(full_msg)
        tmp = f.name
    try:
        result = subprocess.run(
            f"git commit -F {tmp}",
            shell=True, text=True,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE
        )
        print(result.stdout.strip())
        if result.returncode != 0:
            print(result.stderr.strip())
            sys.exit(result.returncode)
    finally:
        os.unlink(tmp)

    if push:
        print()
        subprocess.run("git push", shell=True, check=False)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="AI-powered git commit messages")
    parser.add_argument("--dry", action="store_true", help="Print message only, don't commit")
    parser.add_argument("--all", "-a", action="store_true", help="git add -A before diffing")
    parser.add_argument("--push", "-p", action="store_true", help="git push after committing")
    parser.add_argument("--yes", "-y", action="store_true", help="Skip confirmation prompt")
    args = parser.parse_args()

    # Stage everything if requested
    if args.all:
        run("git add -A", capture=False)

    diff = get_diff()
    context = get_context()

    while True:
        msg = generate_message(diff, context)

        if args.dry:
            print()
            print(msg)
            sys.exit(0)

        if args.yes:
            confirmed = msg
        else:
            confirmed = confirm_or_edit(msg)

        if confirmed is not None:
            do_commit(confirmed, push=args.push)
            break
        # else: regenerate


if __name__ == "__main__":
    main()
