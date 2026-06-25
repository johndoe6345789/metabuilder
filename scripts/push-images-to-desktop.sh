#!/usr/bin/env bash
# Transfer all local Docker images to rdesktop via Tailscale SSH
# Groups images by ID so shared layers are only sent once.

set -euo pipefail

REMOTE="r@rdesktop.taild98fe6.ts.net"
LOG="/tmp/docker-push-$(date +%Y%m%d-%H%M%S).log"

echo "=== Docker image transfer to rdesktop ===" | tee "$LOG"
echo "Started: $(date)" | tee -a "$LOG"
echo "" | tee -a "$LOG"

# Get image IDs already on remote
echo "Fetching remote image IDs..." | tee -a "$LOG"
REMOTE_IDS=$(tailscale ssh "$REMOTE" \
    "docker images --format '{{.ID}}'" 2>/dev/null \
    | grep -v Warning | grep -v Authentication \
    | grep -v "Time since" || true)

# Build list: <id> <tag1> [<tag2> ...]
declare -A ID_TAGS
while IFS=$'\t' read -r id tag; do
    ID_TAGS["$id"]="${ID_TAGS[$id]:-} $tag"
done < <(docker images --format '{{.ID}}\t{{.Repository}}:{{.Tag}}')

TOTAL=${#ID_TAGS[@]}
COUNT=0
SKIPPED=0
TRANSFERRED=0

for id in "${!ID_TAGS[@]}"; do
    COUNT=$((COUNT + 1))
    TAGS="${ID_TAGS[$id]}"
    FIRST_TAG=$(echo "$TAGS" | awk '{print $1}')

    # Check if already on remote
    if echo "$REMOTE_IDS" | grep -q "^${id}"; then
        echo "[$COUNT/$TOTAL] SKIP  $id ($TAGS)" | tee -a "$LOG"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi

    echo "[$COUNT/$TOTAL] SEND  $id →$TAGS" | tee -a "$LOG"
    START=$(date +%s)

    # shellcheck disable=SC2086
    if docker save $TAGS \
        | tailscale ssh "$REMOTE" "docker load" \
        >> "$LOG" 2>&1; then
        END=$(date +%s)
        ELAPSED=$((END - START))
        echo "  ✓ done in ${ELAPSED}s" | tee -a "$LOG"
        TRANSFERRED=$((TRANSFERRED + 1))
    else
        echo "  ✗ FAILED" | tee -a "$LOG"
    fi
done

echo "" | tee -a "$LOG"
echo "=== Transfer complete ===" | tee -a "$LOG"
echo "Finished:     $(date)" | tee -a "$LOG"
echo "Transferred:  $TRANSFERRED" | tee -a "$LOG"
echo "Skipped:      $SKIPPED" | tee -a "$LOG"
echo "Log:          $LOG" | tee -a "$LOG"
