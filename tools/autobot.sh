#!/usr/bin/env sh
set -eu

# Polling loop (runs locally, every 90s). Breaks if codex returnson-zero.
while :; do
  sleep 90

  # IMPORTANT: use normal ASCII quotes, not “smart quotes”.
  codex exec --full-auto --sandbox="danger-full-access" --cd="/Users/rmac/Documents/GitHub/metabuilder/docs/todo/" "Please resolve my TODO list, Scan project for TODO items." || exit $?

  codex exec \
  
    --sandbox workspace-write \
    0-kickstart.md \
    "Follow 0-kickstart.md exactly.
     You are explicitly allowed to modify source code, configuration files,
     and build files — not just Markdown.
     Do not ask questions.
     If something is ambiguous, make the smallest safe assumption and proceed.
     If nothing is wrong, halt immediately." \

done
