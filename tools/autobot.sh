#!/usr/bin/env sh
set -eu

# If you want to be extra strict: require codex to be a real file (not a shell function).
# POSIX sh doesn't have `type -t`, so we just do a basic sanity check.
if [ ! -x "$CODEX_PATH" ]; then
  echo "ERROR: 'codex' at '$CODEX_PATH' is not executable." >&2
  exit 126
fi

# Polling loop (runs locally, every 90s). Breaks if codex returnson-zero.
while :; do
  sleep 90

  # IMPORTANT: use normal ASCII quotes, not “smart quotes”.
  codex exec --full-auto --sandbox="danger-full-access" --cd="/Users/rmac/Documents/GitHub/metabuilder/docs/todo/" "Please resolve my TODO list, Scan project for TODO items." || exit $?
done
