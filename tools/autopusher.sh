#!/usr/bin/env bash
set -euo pipefail

SLEEP_SECONDS="${SLEEP_SECONDS:-15}"
REMOTE="${REMOTE:-origin}"
NO_VERIFY="${NO_VERIFY:-1}"   # set to 0 to enable hooks
PUSH_RETRIES="${PUSH_RETRIES:-1}" # per loop; keep low since loop repeats

die() { echo "ERROR: $*" >&2; exit 1; }

in_git_repo() {
  git rev-parse --is-inside-work-tree >/dev/null 2>&1
}

current_branch() {
  git rev-parse --abbrev-ref HEAD
}

has_unpushed_commits() {
  # Returns 0 if ahead of upstream, else 1
  local upstream
  if ! upstream="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null)"; then
    return 1
  fi
  [ "$(git rev-list --count "${upstream}..HEAD" 2>/dev/null || echo 0)" -gt 0 ]
}

ensure_upstream() {
  local branch upstream
  branch="$(current_branch)"
  if git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
    return 0
  fi
  echo "No upstream set for '$branch'; setting to ${REMOTE}/${branch}"
  git push -u "$REMOTE" "$branch"
}

safe_git_commit() {
  local msg="$1"
  if [ "$NO_VERIFY" = "1" ]; then
    git commit --no-verify -m "$msg"
  else
    git commit -m "$msg"
  fi
}

safe_git_push() {
  local branch tries=0
  branch="$(current_branch)"
  ensure_upstream

  while :; do
    if git push "$REMOTE" "$branch"; then
      return 0
    fi
    tries=$((tries + 1))
    if [ "$tries" -ge "$PUSH_RETRIES" ]; then
      return 1
    fi
    sleep "$SLEEP_SECONDS"
  done
}

sanitize_token() {
  local s="$1"
  s="${s//_/ }"
  s="${s//-/ }"
  s="${s//./ }"
  s="$(echo "$s" | tr -s ' ' | sed -e 's/^ *//' -e 's/ *$//')"
  echo "$s"
}

top_tokens_from_paths() {
  # Prints up to 3 best-guess tokens (dirs/files/exts) from a newline list of paths.
  local paths="$1"
  local tmp
  tmp="$(mktemp)"
  printf "%s\n" "$paths" | awk '
    function emit(tok) {
      gsub(/[^A-Za-z0-9]+/, " ", tok)
      gsub(/^ +| +$/, "", tok)
      if (length(tok) > 0) print tok
    }
    {
      path=$0
      n=split(path, parts, "/")
      if (n >= 2) emit(parts[1])
      if (n >= 3) emit(parts[2])

      file=parts[n]
      # extension
      m=split(file, fp, ".")
      if (m >= 2) emit(fp[m])
      # basename (no ext)
      base=file
      sub(/\.[^.]+$/, "", base)
      emit(base)
    }
  ' | tr '[:upper:]' '[:lower:]' | awk 'length($0) >= 3' >"$tmp"

  # Collapse to frequency, prefer non-generic words.
  awk '
    BEGIN {
      split("test tests spec specs docs doc readme license changelog vendor thirdparty third_party build dist out tmp temp cache node_modules .git", bad, " ")
      for (i in bad) isbad[bad[i]]=1
    }
    {
      for (i=1; i<=NF; i++) {
        w=$i
        if (!isbad[w]) freq[w]++
      }
    }
    END {
      for (w in freq) print freq[w], w
    }
  ' "$tmp" | sort -rn | awk 'NR<=3 {print $2}' | paste -sd',' - || true

  rm -f "$tmp"
}

detect_verb() {
  # Simple verb heuristic from changed file types
  local paths="$1"
  if echo "$paths" | grep -qiE '\.(md|rst|txt)$'; then
    echo "docs"
    return
  fi
  if echo "$paths" | grep -qiE '\.(yml|yaml|json|toml|ini|cfg)$'; then
    echo "config"
    return
  fi
  if echo "$paths" | grep -qiE '\.(sh|ps1|bat|cmd)$'; then
    echo "scripts"
    return
  fi
  if echo "$paths" | grep -qiE '\.(py|js|ts|tsx|java|kt|c|cc|cpp|h|hpp|rs|go)$'; then
    echo "code"
    return
  fi
  echo "update"
}

generate_message() {
  local name_status paths changed_count verb tokens
  name_status="$(git diff --cached --name-status --diff-filter=ACDMRT || true)"
  if [ -z "$name_status" ]; then
    echo "chore: update"
    return
  fi

  paths="$(echo "$name_status" | awk '{print $NF}' | sed '/^$/d')"
  changed_count="$(echo "$paths" | sed '/^$/d' | wc -l | tr -d ' ')"
  verb="$(detect_verb "$paths")"
  tokens="$(top_tokens_from_paths "$paths")"

  if [ -n "$tokens" ]; then
    echo "${verb}: ${tokens} (${changed_count} files)"
  else
    echo "${verb}: ${changed_count} files"
  fi
}

stage_if_needed() {
  # Stage all changes; returns 0 if anything staged, else 1
  git add -A
  git diff --cached --quiet && return 1
  return 0
}

main_loop() {
  in_git_repo || die "Not inside a git repository."

  while :; do
    if has_unpushed_commits; then
      echo "Unpushed commits detected; attempting push..."
      if ! safe_git_push; then
        echo "Push failed; retrying after ${SLEEP_SECONDS}s..."
        sleep "$SLEEP_SECONDS"
        continue
      fi
      echo "Push succeeded."
      sleep "$SLEEP_SECONDS"
      continue
    fi

    if ! stage_if_needed; then
      sleep "$SLEEP_SECONDS"
      continue
    fi

    local msg
    msg="$(generate_message)"
    echo "Committing: $msg"
    safe_git_commit "$msg" || {
      echo "Commit failed; retrying after ${SLEEP_SECONDS}s..."
      sleep "$SLEEP_SECONDS"
      continue
    }

    echo "Pushing..."
    if ! safe_git_push; then
      echo "Push failed; will retry after ${SLEEP_SECONDS}s (commit preserved)."
      sleep "$SLEEP_SECONDS"
      continue
    fi

    sleep "$SLEEP_SECONDS"
  done
}

main_loop

