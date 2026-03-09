#!/usr/bin/env bash
# Push all locally-built MetaBuilder images to local Nexus registry.
# Tags each image as both :main and :latest at localhost:5050/<owner>/<repo>/<name>.
#
# Usage:
#   ./populate-nexus.sh [--skip-heavy]
#
# --skip-heavy  skip base-conan-deps (32 GB), devcontainer (41 GB), media-daemon (3.5 GB)

set -euo pipefail

NEXUS="localhost:5050"
SLUG="johndoe6345789/metabuilder-small"
NEXUS_USER="admin"
NEXUS_PASS="nexus"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

SKIP_HEAVY=false
[[ "${1:-}" == "--skip-heavy" ]] && SKIP_HEAVY=true

log()  { echo -e "${BLUE}[nexus]${NC} $*"; }
ok()   { echo -e "${GREEN}[nexus]${NC} $*"; }
warn() { echo -e "${YELLOW}[nexus]${NC} $*"; }
err()  { echo -e "${RED}[nexus]${NC} $*"; }

# ── Login ────────────────────────────────────────────────────────────────────
log "Logging in to $NEXUS..."
echo "$NEXUS_PASS" | docker login "$NEXUS" -u "$NEXUS_USER" --password-stdin

# ── Image map: local_tag → nexus_name ────────────────────────────────────────
# Format: "local_image|nexus_name|size_hint"
#
# Base images (metabuilder/* prefix, built by build-base-images.sh)
declare -a BASE_IMAGES=(
  "metabuilder/base-apt:latest|base-apt|2.8GB"
  "metabuilder/base-node-deps:latest|base-node-deps|5.5GB"
  "metabuilder/base-pip-deps:latest|base-pip-deps|1.4GB"
  "metabuilder/base-android-sdk:latest|base-android-sdk|6.1GB"
)

# Heavy base images — pushed last (or skipped with --skip-heavy)
declare -a HEAVY_IMAGES=(
  "metabuilder/base-conan-deps:latest|base-conan-deps|32GB"
  "metabuilder/devcontainer:latest|devcontainer|41GB"
)

# App images (deployment-* prefix, built by docker-compose)
declare -a APP_IMAGES=(
  "deployment-dbal-init:latest|dbal-init|12MB"
  "deployment-storybook:latest|storybook|112MB"
  "deployment-nginx:latest|nginx|92MB"
  "deployment-nginx-stream:latest|nginx-stream|92MB"
  "deployment-pastebin-backend:latest|pastebin-backend|236MB"
  "deployment-emailclient-app:latest|emailclient|350MB"
  "deployment-email-service:latest|email-service|388MB"
  "deployment-exploded-diagrams:latest|exploded-diagrams|315MB"
  "deployment-pastebin:latest|pastebin|382MB"
  "deployment-frontend-app:latest|frontend-app|361MB"
  "deployment-workflowui:latest|workflowui|542MB"
  "deployment-postgres-dashboard:latest|postgres-dashboard|508MB"
  "deployment-smtp-relay:latest|smtp-relay|302MB"
  "deployment-dbal:latest|dbal|3.0GB"
  "deployment-codegen:latest|codegen|5.6GB"
)

declare -a HEAVY_APP_IMAGES=(
  "deployment-media-daemon:latest|media-daemon|3.5GB"
)

# ── Push function ─────────────────────────────────────────────────────────────
pushed=0; skipped=0; failed=0

push_image() {
  local src="$1" name="$2" size="$3"

  # Check source exists
  if ! docker image inspect "$src" &>/dev/null; then
    warn "SKIP $name — $src not found locally"
    ((skipped++)) || true
    return
  fi

  local dst_main="$NEXUS/$SLUG/$name:main"
  local dst_latest="$NEXUS/$SLUG/$name:latest"

  log "Pushing $name ($size)..."
  docker tag "$src" "$dst_main"
  docker tag "$src" "$dst_latest"

  if docker push "$dst_main" && docker push "$dst_latest"; then
    ok "  ✓ $name → :main + :latest"
    ((pushed++)) || true
  else
    err "  ✗ $name FAILED"
    ((failed++)) || true
  fi
}

# ── Execute ──────────────────────────────────────────────────────────────────
echo ""
log "Registry  : $NEXUS"
log "Slug      : $SLUG"
log "Skip heavy: $SKIP_HEAVY"
echo ""

for entry in "${BASE_IMAGES[@]}";     do IFS='|' read -r src name size <<< "$entry"; push_image "$src" "$name" "$size"; done
for entry in "${APP_IMAGES[@]}";      do IFS='|' read -r src name size <<< "$entry"; push_image "$src" "$name" "$size"; done

if $SKIP_HEAVY; then
  warn "Skipping heavy images (--skip-heavy set):"
  for entry in "${HEAVY_IMAGES[@]}" "${HEAVY_APP_IMAGES[@]}"; do
    IFS='|' read -r src name size <<< "$entry"; warn "  $name ($size)"
  done
else
  log "--- Heavy images (this will take a while) ---"
  for entry in "${HEAVY_APP_IMAGES[@]}"; do IFS='|' read -r src name size <<< "$entry"; push_image "$src" "$name" "$size"; done
  for entry in "${HEAVY_IMAGES[@]}";     do IFS='|' read -r src name size <<< "$entry"; push_image "$src" "$name" "$size"; done
fi

echo ""
echo -e "${GREEN}══════════════════════════════════════════${NC}"
echo -e "${GREEN}  Done.  pushed=$pushed  skipped=$skipped  failed=$failed${NC}"
echo -e "${GREEN}══════════════════════════════════════════${NC}"
echo ""
echo -e "Browse: http://localhost:8091  (admin/nexus → Browse → docker/local)"
echo -e "Use:    act push -j <job> --artifact-server-path /tmp/act-artifacts --env REGISTRY=localhost:5050"
