#!/bin/sh
# Lightweight Nexus initialisation for CI — npm repos only (no Docker, no Artifactory).
# Full local dev setup uses nexus-init.sh via docker compose.
set -e

NEXUS_URL="${NEXUS_URL:-http://localhost:8091}"
NEW_PASS="${NEXUS_ADMIN_NEW_PASS:-nexus}"
PASS_FILE="/tmp/nexus-data/admin.password"

log() { echo "[nexus-ci-init] $*"; }

# ── Resolve admin password ──────────────────────────────────────────────────
HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
  "$NEXUS_URL/service/rest/v1/status" -u "admin:$NEW_PASS")
if [ "$HTTP" = "200" ]; then
  log "Already initialised with password '$NEW_PASS'"
elif [ -f "$PASS_FILE" ]; then
  INIT_PASS=$(cat "$PASS_FILE")
  log "First run: setting admin password..."
  curl -sf -X PUT \
    "$NEXUS_URL/service/rest/v1/security/users/admin/change-password" \
    -u "admin:$INIT_PASS" -H "Content-Type: text/plain" -d "$NEW_PASS"
  log "Admin password set"
else
  log "ERROR: cannot authenticate and no password file found"
  exit 1
fi

AUTH="admin:$NEW_PASS"

# ── Enable anonymous access ────────────────────────────────────────────────
curl -sf -X PUT "$NEXUS_URL/service/rest/v1/security/anonymous" \
  -u "$AUTH" -H "Content-Type: application/json" \
  -d '{"enabled":true,"userId":"anonymous","realmName":"NexusAuthorizingRealm"}' || true
log "Anonymous access enabled"

# Enable npm token realm
curl -sf -X PUT "$NEXUS_URL/service/rest/v1/security/realms/active" \
  -u "$AUTH" -H "Content-Type: application/json" \
  -d '["NexusAuthenticatingRealm","NpmToken"]' || true

# ── npm-hosted (patched packages) ─────────────────────────────────────────
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  "$NEXUS_URL/service/rest/v1/repositories/npm/hosted" \
  -u "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "npm-hosted",
  "online": true,
  "storage": {"blobStoreName": "default", "strictContentTypeValidation": true, "writePolicy": "allow"}
}')
case "$HTTP" in
  201) log "npm-hosted repo created" ;;
  400) log "npm-hosted repo already exists" ;;
  *)   log "ERROR creating npm-hosted: HTTP $HTTP"; exit 1 ;;
esac

# ── npm-proxy (npmjs.org cache) ───────────────────────────────────────────
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  "$NEXUS_URL/service/rest/v1/repositories/npm/proxy" \
  -u "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "npm-proxy",
  "online": true,
  "storage": {"blobStoreName": "default", "strictContentTypeValidation": true},
  "proxy": {"remoteUrl": "https://registry.npmjs.org", "contentMaxAge": 1440, "metadataMaxAge": 1440},
  "httpClient": {"blocked": false, "autoBlock": true},
  "negativeCache": {"enabled": true, "timeToLive": 1440}
}')
case "$HTTP" in
  201) log "npm-proxy repo created" ;;
  400) log "npm-proxy repo already exists" ;;
  *)   log "ERROR creating npm-proxy: HTTP $HTTP"; exit 1 ;;
esac

# ── npm-group (combines hosted + proxy) ──────────────────────────────────
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  "$NEXUS_URL/service/rest/v1/repositories/npm/group" \
  -u "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "npm-group",
  "online": true,
  "storage": {"blobStoreName": "default", "strictContentTypeValidation": true},
  "group": {"memberNames": ["npm-hosted", "npm-proxy"]}
}')
case "$HTTP" in
  201) log "npm-group repo created" ;;
  400) log "npm-group repo already exists" ;;
  *)   log "ERROR creating npm-group: HTTP $HTTP"; exit 1 ;;
esac

log "Nexus CI init complete"
