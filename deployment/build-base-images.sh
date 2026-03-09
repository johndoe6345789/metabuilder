#!/usr/bin/env bash
# Build MetaBuilder base Docker images.
#
# These are built ONCE (or when dependency manifests change) and cached locally.
# App image builds then have zero downloads — they just inherit from these bases.
#
# Build order matters:
#   1. base-apt          (no deps)
#   2. base-conan-deps   (needs base-apt)
#   3. base-android-sdk  (needs base-apt)
#   4. base-node-deps    (standalone — node:20-alpine)
#   5. base-pip-deps     (standalone — python:3.11-slim)
#
# Usage:
#   ./build-base-images.sh              Build missing base images (skip existing)
#   ./build-base-images.sh --force      Rebuild all base images
#   ./build-base-images.sh apt node     Build specific images (skip if exist)
#   ./build-base-images.sh --list       List available images

# Require bash 4+ for associative arrays (macOS ships 3.2)
if ((BASH_VERSINFO[0] < 4)); then
    for candidate in /opt/homebrew/bin/bash /usr/local/bin/bash; do
        if [[ -x "$candidate" ]] && "$candidate" -c '((BASH_VERSINFO[0]>=4))' 2>/dev/null; then
            exec "$candidate" "$0" "$@"
        fi
    done
    echo "Error: bash 4+ required (found bash $BASH_VERSION)"
    echo "Install with: brew install bash"
    exit 1
fi

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BASE_DIR="$SCRIPT_DIR/base-images"

# ── Helpers ───────────────────────────────────────────────────────────────────

log_info()    { echo -e "${BLUE}[base]${NC} $*"; }
log_ok()      { echo -e "${GREEN}[base]${NC} $*"; }
log_warn()    { echo -e "${YELLOW}[base]${NC} $*"; }
log_err()     { echo -e "${RED}[base]${NC} $*"; }

# Build one image with retry (handles flaky network during FROM pulls).
build_with_retry() {
    local tag="$1"
    local dockerfile="$2"
    local max=5

    log_info "Building $tag ..."
    echo ""

    for i in $(seq 1 $max); do
        if docker build \
            --file "$BASE_DIR/$dockerfile" \
            --tag "$tag" \
            --tag "${tag%:*}:$(date +%Y%m%d)" \
            "$PROJECT_ROOT"; then
            echo ""
            log_ok "$tag built successfully"
            return 0
        fi

        if [ "$i" -lt "$max" ]; then
            local wait=$(( i * 15 ))
            log_warn "Build failed (attempt $i/$max), retrying in ${wait}s ..."
            sleep "$wait"
        fi
    done

    log_err "Failed to build $tag after $max attempts"
    return 1
}

# ── Image definitions (order = build order) ───────────────────────────────────

declare -A IMAGE_FILE=(
    [apt]="Dockerfile.apt"
    [conan-deps]="Dockerfile.conan-deps"
    [node-deps]="Dockerfile.node-deps"
    [pip-deps]="Dockerfile.pip-deps"
    [android-sdk]="Dockerfile.android-sdk"
    [devcontainer]="Dockerfile.devcontainer"
)

declare -A IMAGE_TAG=(
    [apt]="metabuilder/base-apt:latest"
    [conan-deps]="metabuilder/base-conan-deps:latest"
    [node-deps]="metabuilder/base-node-deps:latest"
    [pip-deps]="metabuilder/base-pip-deps:latest"
    [android-sdk]="metabuilder/base-android-sdk:latest"
    [devcontainer]="metabuilder/devcontainer:latest"
)

# Build order respects dependencies:
#   base-apt → conan-deps, android-sdk
#   conan-deps + node-deps + pip-deps + android-sdk → devcontainer
BUILD_ORDER=(apt conan-deps android-sdk node-deps pip-deps devcontainer)

# ── Argument parsing ──────────────────────────────────────────────────────────

if [[ "$1" == "--list" ]]; then
    echo "Available base images:"
    for name in "${BUILD_ORDER[@]}"; do
        echo "  $name  →  ${IMAGE_TAG[$name]}"
    done
    exit 0
fi

FORCE=false
TARGETS=()
for arg in "$@"; do
    if [[ "$arg" == "--force" ]]; then
        FORCE=true
    elif [[ -v IMAGE_FILE[$arg] ]]; then
        TARGETS+=("$arg")
    else
        log_err "Unknown image: $arg"
        echo "Available: ${BUILD_ORDER[*]}"
        exit 1
    fi
done

# Default: build all (in dependency order)
if [ ${#TARGETS[@]} -eq 0 ]; then
    TARGETS=("${BUILD_ORDER[@]}")
fi

# ── Build ─────────────────────────────────────────────────────────────────────

echo ""
echo -e "${BLUE}MetaBuilder Base Image Builder${NC}"
echo -e "Building: ${TARGETS[*]}"
echo ""

FAILED=()
SKIPPED=()
for name in "${BUILD_ORDER[@]}"; do
    # Skip if not in TARGETS
    [[ " ${TARGETS[*]} " == *" $name "* ]] || continue

    # Skip if image already exists (unless --force)
    if [[ "$FORCE" != "true" ]] && docker image inspect "${IMAGE_TAG[$name]}" &>/dev/null; then
        SKIPPED+=("$name")
        log_ok "Skipping $name — ${IMAGE_TAG[$name]} already exists (use --force to rebuild)"
        echo ""
        continue
    fi

    if ! build_with_retry "${IMAGE_TAG[$name]}" "${IMAGE_FILE[$name]}"; then
        FAILED+=("$name")
        log_warn "Continuing with remaining images..."
    fi

    echo ""
done

# ── Summary ───────────────────────────────────────────────────────────────────

echo ""
if [ ${#FAILED[@]} -eq 0 ]; then
    echo -e "${GREEN}All base images built successfully!${NC}"
    echo ""
    echo "Built images:"
    for name in "${BUILD_ORDER[@]}"; do
        [[ " ${TARGETS[*]} " == *" $name "* ]] || continue
        SIZE=$(docker image inspect "${IMAGE_TAG[$name]}" \
               --format '{{.Size}}' 2>/dev/null \
               | awk '{printf "%.1f GB", $1/1073741824}')
        echo -e "  ${GREEN}✓${NC}  ${IMAGE_TAG[$name]}  ($SIZE)"
    done
    echo ""
    echo "Now run:  cd deployment && ./build-apps.sh"
else
    echo -e "${RED}Some images failed to build:${NC} ${FAILED[*]}"
    echo "Re-run to retry only failed images:"
    echo "  ./build-base-images.sh ${FAILED[*]}"
    exit 1
fi
