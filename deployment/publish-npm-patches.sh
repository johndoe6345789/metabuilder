#!/usr/bin/env bash
# Publish patched npm packages to a local registry (Nexus or Verdaccio).
#
# These packages fix vulnerabilities in bundled transitive dependencies
# that npm overrides cannot reach (e.g. minimatch/tar inside the npm package).
#
# Prerequisites (choose one):
#   Nexus:     docker compose -f docker-compose.nexus.yml up -d
#   Verdaccio: npx verdaccio --config deployment/verdaccio.yaml &
#
# Usage:
#   ./publish-npm-patches.sh              # auto-detect (Nexus first, Verdaccio fallback)
#   ./publish-npm-patches.sh --verdaccio  # force Verdaccio on :4873
#   ./publish-npm-patches.sh --nexus      # force Nexus on :8091

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

# Parse flags
USE_VERDACCIO=false
USE_NEXUS=false
for arg in "$@"; do
  case "$arg" in
    --verdaccio) USE_VERDACCIO=true ;;
    --nexus)     USE_NEXUS=true ;;
  esac
done

# Auto-detect: try Nexus first, fall back to Verdaccio
if ! $USE_VERDACCIO && ! $USE_NEXUS; then
  if curl -sf http://localhost:8091/service/rest/v1/status -u admin:nexus >/dev/null 2>&1; then
    USE_NEXUS=true
  else
    USE_VERDACCIO=true
  fi
fi

NEXUS_URL="${NEXUS_URL:-http://localhost:8091}"
NEXUS_NPM_HOSTED="${NEXUS_URL}/repository/npm-hosted/"
NEXUS_USER="${NEXUS_USER:-admin}"
NEXUS_PASS="${NEXUS_PASS:-nexus}"
VERDACCIO_URL="${VERDACCIO_URL:-http://localhost:4873}"

# Packages to patch — version must be the exact fixed version
PATCHES=(
  "minimatch@10.2.4"
  "tar@7.5.11"
)

# Pre-patched local packages (tarball already in deployment/npm-patches/)
# Format: "name@version:filename"
LOCAL_PATCHES=(
  "@esbuild-kit/core-utils@3.3.3-metabuilder.0:esbuild-kit-core-utils-3.3.3-metabuilder.0.tgz"
)

WORK_DIR=$(mktemp -d)
trap 'rm -rf "$WORK_DIR"' EXIT

log() { echo -e "${GREEN}[npm-patch]${NC} $*"; }
warn() { echo -e "${YELLOW}[npm-patch]${NC} $*"; }
fail() { echo -e "${RED}[npm-patch]${NC} $*"; exit 1; }

NPM_RC="$WORK_DIR/.npmrc"

if $USE_NEXUS; then
  log "Using Nexus at $NEXUS_URL..."
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$NEXUS_URL/service/rest/v1/status" -u "$NEXUS_USER:$NEXUS_PASS")
  if [ "$HTTP" != "200" ]; then
    fail "Cannot reach Nexus (HTTP $HTTP). Is it running?"
  fi
  log "Nexus is up"
  NEXUS_AUTH=$(echo -n "$NEXUS_USER:$NEXUS_PASS" | base64)
  cat > "$NPM_RC" <<EOF
//$(echo "$NEXUS_NPM_HOSTED" | sed 's|https\?://||'):_auth=$NEXUS_AUTH
EOF
  PUBLISH_REGISTRY="$NEXUS_NPM_HOSTED"
  PUBLISH_ARGS="--userconfig $NPM_RC"
else
  log "Using Verdaccio at $VERDACCIO_URL..."
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$VERDACCIO_URL/-/ping")
  if [ "$HTTP" != "200" ]; then
    fail "Cannot reach Verdaccio (HTTP $HTTP). Start with: npx verdaccio --config deployment/verdaccio.yaml"
  fi
  log "Verdaccio is up"
  cat > "$NPM_RC" <<EOF
registry=$VERDACCIO_URL/
//${VERDACCIO_URL#*://}/:_authToken=
EOF
  PUBLISH_REGISTRY="$VERDACCIO_URL"
  PUBLISH_ARGS="--registry $VERDACCIO_URL --userconfig $NPM_RC"
fi

published=0
skipped=0

PATCHES_DIR="$SCRIPT_DIR/npm-patches"

# Publish pre-patched local tarballs first
for entry in "${LOCAL_PATCHES[@]}"; do
  pkg_spec="${entry%%:*}"
  tarball_name="${entry##*:}"
  pkg_name="${pkg_spec%%@*}"
  # handle scoped packages like @scope/name
  if [[ "$pkg_spec" == @* ]]; then
    pkg_name="$(echo "$pkg_spec" | cut -d@ -f1-2 | tr -d '@')"
    pkg_name="@${pkg_name}"
    pkg_version="$(echo "$pkg_spec" | cut -d@ -f3)"
  else
    pkg_version="${pkg_spec##*@}"
  fi

  log "Processing local patch $pkg_name@$pkg_version..."

  TARBALL="$PATCHES_DIR/$tarball_name"
  if [ ! -f "$TARBALL" ]; then
    fail "  Patched tarball not found: $TARBALL"
  fi

  log "  Publishing $tarball_name..."
  if npm publish "$TARBALL" $PUBLISH_ARGS --tag patched 2>&1 | grep -v "^npm notice"; then
    log "  ${GREEN}Published${NC} $pkg_name@$pkg_version"
    ((published++)) || true
  else
    warn "  $pkg_name@$pkg_version already exists or publish failed, skipping"
    ((skipped++)) || true
  fi
done

for pkg_spec in "${PATCHES[@]}"; do
  pkg_name="${pkg_spec%%@*}"
  pkg_version="${pkg_spec##*@}"

  log "Processing $pkg_name@$pkg_version..."

  # Check if already published to Nexus
  # Download from npmjs.org and publish to local registry
  cd "$WORK_DIR"
  TARBALL=$(npm pack "$pkg_spec" 2>/dev/null)
  if [ ! -f "$TARBALL" ]; then
    fail "  Failed to download $pkg_spec"
  fi

  log "  Publishing $TARBALL..."
  if npm publish "$TARBALL" $PUBLISH_ARGS --tag patched 2>&1 | grep -v "^npm notice"; then
    log "  ${GREEN}Published${NC} $pkg_name@$pkg_version"
    ((published++)) || true
  else
    warn "  $pkg_name@$pkg_version already exists or publish failed, skipping"
    ((skipped++)) || true
  fi

  rm -f "$TARBALL"
done

echo ""
log "Done. published=$published  skipped=$skipped"
echo ""
if $USE_NEXUS; then
  log "Nexus npm-group: ${NEXUS_URL}/repository/npm-group/"
else
  log "Verdaccio registry: $VERDACCIO_URL"
fi
