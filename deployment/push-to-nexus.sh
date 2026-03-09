#!/usr/bin/env bash
# Push locally-built MetaBuilder images to the local Nexus registry.
#
# Re-tags ghcr.io/<owner>/<repo>/<image>:<tag>  →  localhost:5000/<owner>/<repo>/<image>:<tag>
# so act can use REGISTRY=localhost:5000 and pull from Nexus instead of GHCR.
#
# Usage:
#   ./push-to-nexus.sh                      # push all images at current git ref
#   ./push-to-nexus.sh --tag main           # push with specific tag
#   ./push-to-nexus.sh --src ghcr.io/... \  # pull from remote first, then push
#     --pull
#
# Prerequisites:
#   - Nexus running: docker compose -f docker-compose.nexus.yml up -d
#   - localhost:5000 in Docker Desktop insecure-registries
#   - Images already built locally (or use --pull to fetch from GHCR first)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

LOCAL_REGISTRY="localhost:5050"
NEXUS_USER="admin"
NEXUS_PASS="nexus"

# Derive owner/repo from git remote (matches github.repository format)
REPO_SLUG=$(git -C "$SCRIPT_DIR/.." remote get-url origin 2>/dev/null \
  | sed -E 's|.*github\.com[:/]([^/]+/[^/]+)(\.git)?$|\1|' \
  | tr '[:upper:]' '[:lower:]')
REPO_SLUG="${REPO_SLUG:-johndoe6345789/metabuilder-small}"

SOURCE_REGISTRY="ghcr.io"
TAG=$(git -C "$SCRIPT_DIR/.." rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
DO_PULL=false

# Parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --tag)   TAG="$2"; shift 2 ;;
    --src)   SOURCE_REGISTRY="$2"; shift 2 ;;
    --pull)  DO_PULL=true; shift ;;
    -h|--help)
      grep '^#' "$0" | sed 's/^# //' | sed 's/^#//'
      exit 0 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

# Base images built by container-base-tier1/2/3
BASE_IMAGES=(
  base-apt
  base-node-deps
  base-pip-deps
  base-conan-deps
  base-android-sdk
  devcontainer
)

# App images built by container-build-apps
APP_IMAGES=(
  pastebin
  workflowui
  codegen
  postgres-dashboard
  emailclient
  exploded-diagrams
  storybook
)

ALL_IMAGES=("${BASE_IMAGES[@]}" "${APP_IMAGES[@]}")

echo -e "${YELLOW}Registry:${NC} $LOCAL_REGISTRY"
echo -e "${YELLOW}Slug:${NC}     $REPO_SLUG"
echo -e "${YELLOW}Tag:${NC}      $TAG"
echo ""

# Log in to local Nexus
echo -e "${YELLOW}Logging in to $LOCAL_REGISTRY...${NC}"
echo "$NEXUS_PASS" | docker login "$LOCAL_REGISTRY" -u "$NEXUS_USER" --password-stdin

pushed=0
skipped=0
failed=0

for image in "${ALL_IMAGES[@]}"; do
  src="$SOURCE_REGISTRY/$REPO_SLUG/$image:$TAG"
  dst="$LOCAL_REGISTRY/$REPO_SLUG/$image:$TAG"

  if $DO_PULL; then
    echo -e "  ${YELLOW}pulling${NC} $src..."
    if ! docker pull "$src" 2>/dev/null; then
      echo -e "  ${YELLOW}skip${NC} $image (not found in $SOURCE_REGISTRY)"
      ((skipped++)) || true
      continue
    fi
  fi

  # Check image exists locally
  if ! docker image inspect "$src" >/dev/null 2>&1; then
    # Also check if it's already tagged for local registry
    if ! docker image inspect "$dst" >/dev/null 2>&1; then
      echo -e "  ${YELLOW}skip${NC} $image (not found locally — build first or use --pull)"
      ((skipped++)) || true
      continue
    fi
    # Already has local tag — just push it
  else
    docker tag "$src" "$dst"
  fi

  echo -e "  ${GREEN}push${NC} $dst"
  if docker push "$dst"; then
    ((pushed++)) || true
  else
    echo -e "  ${RED}FAILED${NC} $image"
    ((failed++)) || true
  fi
done

echo ""
echo -e "${GREEN}Done.${NC} pushed=$pushed  skipped=$skipped  failed=$failed"
echo ""
echo -e "Run act with:"
echo -e "  act push -j <job> --artifact-server-path /tmp/act-artifacts \\"
echo -e "    --env REGISTRY=localhost:5050"
