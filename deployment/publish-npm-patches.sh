#!/usr/bin/env bash
# Publish patched npm packages to local Nexus registry.
#
# These packages fix vulnerabilities in bundled transitive dependencies
# that npm overrides cannot reach (e.g. minimatch/tar inside the npm package).
#
# Prerequisites:
#   - Nexus running: docker compose -f docker-compose.nexus.yml up -d
#   - nexus-init completed (npm-hosted repo exists)
#
# Usage:
#   ./publish-npm-patches.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

NEXUS_URL="${NEXUS_URL:-http://localhost:8091}"
NEXUS_NPM_HOSTED="${NEXUS_URL}/repository/npm-hosted/"
NEXUS_USER="${NEXUS_USER:-admin}"
NEXUS_PASS="${NEXUS_PASS:-nexus}"

# Packages to patch — version must be the exact fixed version
PATCHES=(
  "minimatch@10.2.4"
  "tar@7.5.11"
)

WORK_DIR=$(mktemp -d)
trap 'rm -rf "$WORK_DIR"' EXIT

log() { echo -e "${GREEN}[npm-patch]${NC} $*"; }
warn() { echo -e "${YELLOW}[npm-patch]${NC} $*"; }
fail() { echo -e "${RED}[npm-patch]${NC} $*"; exit 1; }

# Verify Nexus is reachable
log "Checking Nexus at $NEXUS_URL..."
HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$NEXUS_URL/service/rest/v1/status" -u "$NEXUS_USER:$NEXUS_PASS")
if [ "$HTTP" != "200" ]; then
  fail "Cannot reach Nexus (HTTP $HTTP). Is it running?"
fi
log "Nexus is up"

# Configure npm auth for Nexus hosted repo
NEXUS_AUTH=$(echo -n "$NEXUS_USER:$NEXUS_PASS" | base64)
NPM_RC="$WORK_DIR/.npmrc"
cat > "$NPM_RC" <<EOF
//$(echo "$NEXUS_NPM_HOSTED" | sed 's|https\?://||'):_auth=$NEXUS_AUTH
EOF

published=0
skipped=0

for pkg_spec in "${PATCHES[@]}"; do
  pkg_name="${pkg_spec%%@*}"
  pkg_version="${pkg_spec##*@}"

  log "Processing $pkg_name@$pkg_version..."

  # Check if already published to Nexus
  CHECK_URL="${NEXUS_URL}/repository/npm-hosted/${pkg_name}/${pkg_version}"
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$CHECK_URL")
  if [ "$HTTP" = "200" ]; then
    warn "  $pkg_name@$pkg_version already in Nexus, skipping"
    ((skipped++)) || true
    continue
  fi

  # Download the tarball from npmjs.org
  cd "$WORK_DIR"
  TARBALL=$(npm pack "$pkg_spec" 2>/dev/null)
  if [ ! -f "$TARBALL" ]; then
    fail "  Failed to download $pkg_spec"
  fi

  # Publish to Nexus hosted repo
  log "  Publishing $TARBALL to Nexus..."
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X PUT \
    -u "$NEXUS_USER:$NEXUS_PASS" \
    -H "Content-Type: application/octet-stream" \
    --data-binary "@$TARBALL" \
    "${NEXUS_NPM_HOSTED}${pkg_name}/-/${TARBALL}")

  case "$HTTP" in
    200|201)
      log "  ${GREEN}Published${NC} $pkg_name@$pkg_version"
      ((published++)) || true
      ;;
    400)
      warn "  $pkg_name@$pkg_version already exists (HTTP 400)"
      ((skipped++)) || true
      ;;
    *)
      fail "  Failed to publish $pkg_name@$pkg_version (HTTP $HTTP)"
      ;;
  esac

  rm -f "$TARBALL"
done

echo ""
log "Done. published=$published  skipped=$skipped"
echo ""
log "To use patched packages, add to .npmrc:"
log "  registry=${NEXUS_URL}/repository/npm-group/"
echo ""
log "Or use scoped overrides in package.json:"
log '  "overrides": { "minimatch": "10.2.4", "tar": "7.5.11" }'
