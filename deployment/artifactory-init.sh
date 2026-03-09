#!/bin/sh
# One-shot Artifactory CE initialisation — runs inside the artifactory-init container.
# Creates Conan2 local + remote + virtual repositories via YAML config API.
#
# NOTE: The JSON REST repository API (PUT /api/repositories/) requires Pro license.
# Artifactory CE supports YAML config patching instead:
#   PATCH /api/system/configuration  (Content-Type: application/yaml)
set -e

ARTIFACTORY_URL="${ARTIFACTORY_URL:-http://artifactory:8081}"
ADMIN_PASS="${ARTIFACTORY_ADMIN_PASS:-password}"
AUTH="admin:$ADMIN_PASS"
API="$ARTIFACTORY_URL/artifactory/api"

log() { echo "[artifactory-init] $*"; }

# ── Wait for Artifactory API to be ready ──────────────────────────────────
log "Waiting for Artifactory API..."
for i in $(seq 1 30); do
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$API/system/ping" -u "$AUTH")
  if [ "$HTTP" = "200" ]; then
    break
  fi
  sleep 2
done
if [ "$HTTP" != "200" ]; then
  log "ERROR: Artifactory API not ready after 60s (HTTP $HTTP)"
  exit 1
fi
log "Artifactory API is ready"

# ── Helper: patch YAML config (idempotent) ────────────────────────────────
patch_yaml() {
  LABEL="$1"
  YAML_BODY="$2"

  RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH \
    "$API/system/configuration" \
    -u "$AUTH" -H "Content-Type: application/yaml" \
    -d "$YAML_BODY")
  HTTP=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  case "$HTTP" in
    200) log "$LABEL — $BODY" ;;
    *)   log "ERROR: $LABEL returned HTTP $HTTP: $BODY"; exit 1 ;;
  esac
}

# ── Check if repos already exist ──────────────────────────────────────────
EXISTING=$(curl -sf -u "$AUTH" "$API/repositories" 2>/dev/null || echo "[]")
if echo "$EXISTING" | grep -q '"conan-local"'; then
  log "conan-local already exists, skipping local repo"
else
  patch_yaml "Create conan-local" "$(cat <<'YAML'
localRepositories:
  conan-local:
    key: conan-local
    type: conan
    packageType: conan
    description: "Local Conan2 repository for private packages"
    repoLayoutRef: conan-default
    handleReleases: true
    handleSnapshots: false
YAML
)"
fi

if echo "$EXISTING" | grep -q '"conan-remote"'; then
  log "conan-remote already exists, skipping remote repo"
else
  patch_yaml "Create conan-remote" "$(cat <<'YAML'
remoteRepositories:
  conan-remote:
    key: conan-remote
    type: conan
    packageType: conan
    url: "https://center2.conan.io"
    description: "Proxy cache for Conan Center"
    repoLayoutRef: conan-default
    handleReleases: true
    handleSnapshots: false
YAML
)"
fi

if echo "$EXISTING" | grep -q '"generic-local"'; then
  log "generic-local already exists, skipping generic repo"
else
  patch_yaml "Create generic-local" "$(cat <<'YAML'
localRepositories:
  generic-local:
    key: generic-local
    type: generic
    packageType: generic
    description: "Generic artifact storage"
    repoLayoutRef: simple-default
    handleReleases: true
    handleSnapshots: false
YAML
)"
fi

# Virtual repo must be created after local + remote
if echo "$EXISTING" | grep -q '"conan-virtual"'; then
  log "conan-virtual already exists, skipping virtual repo"
else
  patch_yaml "Create conan-virtual" "$(cat <<'YAML'
virtualRepositories:
  conan-virtual:
    key: conan-virtual
    type: conan
    packageType: conan
    description: "Virtual Conan2 repo — local packages + ConanCenter cache"
    repositories:
      - conan-local
      - conan-remote
    defaultDeploymentRepo: conan-local
YAML
)"
fi

# ── Verify repos are accessible ──────────────────────────────────────────
log "Verifying repositories..."
for REPO in conan-local conan-remote conan-virtual generic-local; do
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
    "$ARTIFACTORY_URL/artifactory/$REPO/" -u "$AUTH")
  if [ "$HTTP" = "200" ]; then
    log "  ok $REPO"
  else
    log "  WARN $REPO (HTTP $HTTP)"
  fi
done

log ""
log "======================================"
log "  Artifactory CE ready!"
log "  Web UI     : http://localhost:8092"
log "  Login      : admin / $ADMIN_PASS"
log ""
log "  Conan2 repos:"
log "    Local   : $ARTIFACTORY_URL/artifactory/api/conan/conan-local"
log "    Remote  : $ARTIFACTORY_URL/artifactory/api/conan/conan-remote"
log "    Virtual : $ARTIFACTORY_URL/artifactory/api/conan/conan-virtual"
log ""
log "  Conan client setup:"
log "    conan remote add artifactory http://localhost:8092/artifactory/api/conan/conan-virtual"
log "    conan remote login artifactory admin -p $ADMIN_PASS"
log "======================================"
