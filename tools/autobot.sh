#!/usr/bin/env sh
set -eu

# Polling loop (runs locally, every 90s). Breaks if codex returnson-zero.
while :; do
  sleep 90

  # IMPORTANT: use normal ASCII quotes, not “smart quotes”.
  codex exec --full-auto --sandbox="danger-full-access" --cd="/Users/rmac/Documents/GitHub/metabuilder/docs/todo/" "Please resolve my TODO list, Scan project for TODO items." || exit $?
\\
done
