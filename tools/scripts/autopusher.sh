#!/usr/bin/env bash
set -euo pipefail


# Get log at -./git-bot.log

SLEEP_SECONDS="${SLEEP_SECONDS:-15}"
REMOTE="${REMOTE:-origin}"
NO_VERIFY="${NO_VERIFY:-1}"          # 1 => bypass commit hooks
PUSH_RETRIES="${PUSH_RETRIES:-1}"    # per loop; loop repeats anyway
LOG_FILE="${LOG_FILE:-./git-bot.log}"

mkdir -p "$(dirname "$LOG_FILE")"

log() {
  printf '%s [%s] %s\n' \
    "$(date '+%Y-%m-%d %H:%M:%S')" \
    "$$" \
    "$*" >>"$LOG_FILE"
}

action() {
  printf "."
  log "ACTION: $*"
}

die() { log "FATAL: $*"; echo "ERROR: $*" >&2; exit 1; }

# Mirror stdout/stderr to log
exec > >(tee -a "$LOG_FILE") 2>&1

trap 'log "Bot exiting (rc=$?)"' EXIT

in_git_repo() {
  git rev-parse --is-inside-work-tree >/dev/null 2>&1
}

current_branch() {
  git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "HEAD"
}

has_unpushed_commits() {
  local upstream
  if ! upstream="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' \
      2>/dev/null)"; then
    return 1
  fi
  [ "$(git rev-list --count "${upstream}..HEAD" 2>/dev/null || echo 0)" -gt 0 ]
}

stage_if_needed() {
  action "stage"
  if ! git add -A; then
    log "git add -A failed"
    return 1
  fi
  if git diff --cached --quiet; then
    return 1
  fi
  return 0
}

detect_verb() {
  local paths="$1"
  if echo "$paths" | grep -qiE '\.(md|rst|txt)$'; then echo "docs"; return; fi
  if echo "$paths" | grep -qiE '\.(yml|yaml|json|toml|ini|cfg)$'; then
    echo "config"; return
  fi
  if echo "$paths" | grep -qiE '\.(sh|ps1|bat|cmd)$'; then
    echo "scripts"; return
  fi
  if echo "$paths" | grep -qiE \
    '\.(py|js|ts|tsx|java|kt|c|cc|cpp|h|hpp|rs|go)$'; then
    echo "code"; return
  fi
  echo "update"
}

top_tokens_from_paths() {
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
      m=split(file, fp, ".")
      if (m >= 2) emit(fp[m])
      base=file
      sub(/\.[^.]+$/, "", base)
      emit(base)
    }
  ' | tr '[:upper:]' '[:lower:]' | awk 'length($0) >= 3' >"$tmp"

  awk '
    BEGIN {
      split("test tests spec specs docs doc readme license changelog vendor \
thirdparty third_party build dist out tmp temp cache node_modules .git", \
bad, " ")
      for (i in bad) isbad[bad[i]]=1
    }
    {
      for (i=1; i<=NF; i++) {
        w=$i
        if (!isbad[w]) freq[w]++
      }
    }
    END { for (w in freq) print freq[w], w }
  ' "$tmp" | sort -rn | awk 'NR<=3 {print $2}' | paste -sd',' - || true

  rm -f "$tmp"
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

safe_git_commit() {
  local msg="$1"
  action "commit"
  if [ "$NO_VERIFY" = "1" ]; then
    if ! git commit --no-verify -m "$msg"; then
      log "git commit (no-verify) failed"
      return 1
    fi
  else
    if ! git commit -m "$msg"; then
      log "git commit failed"
      return 1
    fi
  fi
  return 0
}

ensure_upstream() {
  local branch
  branch="$(current_branch)"

  if [ "$branch" = "HEAD" ]; then
    log "Detached HEAD; cannot set upstream"
    return 1
  fi

  if git rev-parse --abbrev-ref --symbolic-full-name '@{u}' \
      >/dev/null 2>&1; then
    return 0
  fi

  log "No upstream set for '$branch'; attempting: git push -u $REMOTE $branch"
  action "push -u"
  if ! git push -u "$REMOTE" "$branch"; then
    log "Failed to set upstream for '$branch'"
    return 1
  fi
  return 0
}

safe_git_push() {
  local branch tries=0
  branch="$(current_branch)"

  while :; do
    if ! ensure_upstream; then
      tries=$((tries + 1))
      if [ "$tries" -ge "$PUSH_RETRIES" ]; then
        return 1
      fi
      action "retry sleep"
      sleep "$SLEEP_SECONDS"
      continue
    fi

    action "push"
    if git push "$REMOTE" "$branch"; then
      return 0
    fi

    log "git push failed for '$branch' (try $tries)"
    tries=$((tries + 1))
    if [ "$tries" -ge "$PUSH_RETRIES" ]; then
      return 1
    fi
    action "retry sleep"
    sleep "$SLEEP_SECONDS"
  done
}

main_loop() {
  in_git_repo || die "Not inside a git repository."
  log "Bot starting (REMOTE=$REMOTE SLEEP_SECONDS=$SLEEP_SECONDS NO_VERIFY=$NO_VERIFY)"

  while :; do
    if has_unpushed_commits; then
      log "Unpushed commits detected; attempting push"
      if safe_git_push; then
        log "Push succeeded"
      else
        log "Push failed"
      fi
      sleep "$SLEEP_SECONDS"
      continue
    fi

    if ! stage_if_needed; then
      sleep "$SLEEP_SECONDS"
      continue
    fi

    msg="$(generate_message)"
    log "Commit message: $msg"

    if ! safe_git_commit "$msg"; then
      log "Commit failed; sleeping"
      action "retry sleep"
      sleep "$SLEEP_SECONDS"
      continue
    fi

    if safe_git_push; then
      log "Push after commit succeeded"
    else
      log "Push after commit failed"
    fi

    sleep "$SLEEP_SECONDS"
  done
}

main_loop
