#!/usr/bin/env sh
set -eu

# Local-only guardrails:
# - Ensure `codex` exists and is executable.
# - Ensure we're not accidentally calling a remote wrapper/alias.
# - Ensure the instruction file exists locally.

if ! command -v codex >/dev/null 2>&1; then
  echo "ERROR: 'codex' not found in PATH." >&2
  exit 127
fi

CODEX_PATH="$(command -v codex)"

# If you want to be extra strict: require codex to be a real file (not a shell function).
# POSIX sh doesn't have `type -t`, so we just do a basic sanity check.
if [ ! -x "$CODEX_PATH" ]; then
  echo "ERROR: 'codex' at '$CODEX_PATH' is not executable." >&2
  exit 126
fi

KICKSTART_FILE="0-kickstart.md"
if [ ! -f "$KICKSTART_FILE" ]; then
  echo "ERROR: Missing local file: $KICKSTART_FILE" >&2
  exit 1
fi

# Optional: confirm we’re running from the intended directory (e.g., repo root)
# if [ ! -d .git ]; then
#   echo "ERROR: Not in a git repo root (no .git directory found)." >&2
#   exit 1
# fi

# Polling loop (runs locally, every 90s). Breaks if codex returnson-zero.
while :; do
  sleep 90

  # IMPORTANT: use normal ASCII quotes, not “smart quotes”.
  codex exec --full-auto --sandbox="danger-full-access" --cd="/Users/rmac/Documents/GitHub/metabuilder/docs/todo/" "Please resolve my TODO list" || exit $?
done
