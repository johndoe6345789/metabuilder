#!/usr/bin/env bash
# Build Docker images for all MetaBuilder web applications.
# Uses multi-stage Dockerfiles — no local pre-building required.
#
# Usage:
#   ./build-apps.sh                Build missing app images (skip existing)
#   ./build-apps.sh --force        Rebuild all app images
#   ./build-apps.sh workflowui    Build specific app image
#   ./build-apps.sh --sequential  Build sequentially (less RAM)

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.stack.yml"

# Ensure base-node-deps exists — all frontend Dockerfiles depend on it.
# Other base images (apt, conan, pip, android-sdk) are only needed for
# C++ daemons, dev containers, and workflow plugins.
ensure_node_deps_base() {
    if docker image inspect "metabuilder/base-node-deps:latest" &>/dev/null; then
        echo -e "${GREEN}Base image metabuilder/base-node-deps:latest exists${NC}"
        return 0
    fi

    echo -e "${YELLOW}Building metabuilder/base-node-deps (required by all Node.js frontends)...${NC}"
    local REPO_ROOT
    REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
    docker build \
        -f "$SCRIPT_DIR/base-images/Dockerfile.node-deps" \
        -t metabuilder/base-node-deps:latest \
        "$REPO_ROOT"

    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to build base-node-deps — cannot proceed with app builds${NC}"
        exit 1
    fi
    echo -e "${GREEN}Built metabuilder/base-node-deps:latest${NC}"
}

# Check optional base images (warn only, don't block)
check_optional_bases() {
    local missing=()
    local bases=(
        "metabuilder/base-apt:latest"
        "metabuilder/base-conan-deps:latest"
        "metabuilder/base-pip-deps:latest"
        "metabuilder/base-android-sdk:latest"
    )
    for img in "${bases[@]}"; do
        if ! docker image inspect "$img" &>/dev/null; then
            missing+=("$img")
        fi
    done
    if [ ${#missing[@]} -gt 0 ]; then
        echo -e "${YELLOW}Optional base images not built (C++ daemons, dev container):${NC}"
        for img in "${missing[@]}"; do
            echo "  - $img"
        done
        echo -e "${YELLOW}Build with:${NC}  ./build-base-images.sh"
        echo ""
    fi
}

ensure_node_deps_base
check_optional_bases

PARALLEL=true
FORCE=false
TARGETS=()

for arg in "$@"; do
    case "$arg" in
        --sequential) PARALLEL=false ;;
        --force) FORCE=true ;;
        *) TARGETS+=("$arg") ;;
    esac
done

# Note: media-daemon excluded — C++ source not yet complete (WIP: tv, radio, retro gaming)
ALL_APPS=(workflowui codegen pastebin postgres emailclient exploded-diagrams storybook frontend-app dbal)

# Map friendly name to docker compose service name
resolve_service() {
    case "$1" in
        workflowui)        echo "workflowui" ;;
        codegen)           echo "codegen" ;;
        pastebin)          echo "pastebin" ;;
        postgres)          echo "postgres-dashboard" ;;
        emailclient)       echo "emailclient-app" ;;
        exploded-diagrams) echo "exploded-diagrams" ;;
        storybook)         echo "storybook" ;;
        frontend-app)      echo "frontend-app" ;;
        dbal)              echo "dbal" ;;
        *)                 echo "" ;;
    esac
}

# If no targets specified, build all
if [ ${#TARGETS[@]} -eq 0 ]; then
    TARGETS=("${ALL_APPS[@]}")
fi

# Resolve service names
SERVICES=()
for target in "${TARGETS[@]}"; do
    service="$(resolve_service "$target")"
    if [ -z "$service" ]; then
        echo -e "${RED}Unknown target: $target${NC}"
        echo "Available: ${ALL_APPS[*]}"
        exit 1
    fi
    SERVICES+=("$service")
done

# Skip services whose images already exist (unless --force)
if [[ "$FORCE" != "true" ]]; then
    NEEDS_BUILD=()
    NEEDS_BUILD_NAMES=()
    for i in "${!TARGETS[@]}"; do
        target="${TARGETS[$i]}"
        service="${SERVICES[$i]}"
        img="deployment-${service}"
        if docker image inspect "$img" &>/dev/null; then
            echo -e "${GREEN}Skipping $target${NC} — image $img already exists (use --force to rebuild)"
        else
            NEEDS_BUILD_NAMES+=("$target")
            NEEDS_BUILD+=("$service")
        fi
    done
    if [ ${#NEEDS_BUILD[@]} -eq 0 ]; then
        echo ""
        echo -e "${GREEN}All app images already built! Use --force to rebuild.${NC}"
        exit 0
    fi
    TARGETS=("${NEEDS_BUILD_NAMES[@]}")
    SERVICES=("${NEEDS_BUILD[@]}")
fi

echo -e "${YELLOW}Building: ${TARGETS[*]}${NC}"
echo ""

# Pre-pull base images that app Dockerfiles depend on (with retry for flaky connections)
echo -e "${YELLOW}Pre-pulling base images for app builds...${NC}"
for img in "node:20-alpine" "node:22-alpine" "python:3.11-slim" "python:3.12-slim" "alpine:3.19"; do
    if ! docker image inspect "$img" &>/dev/null; then
        echo "  Pulling $img..."
        for i in 1 2 3 4 5; do
            docker pull "$img" && break \
                || (echo "  Retry $i/5..." && sleep $((i * 10)))
        done
    fi
done
echo ""

MAX_BUILD_ATTEMPTS=5
BUILD_ATTEMPT=0
BUILD_OK=false

while [ $BUILD_ATTEMPT -lt $MAX_BUILD_ATTEMPTS ]; do
    BUILD_ATTEMPT=$((BUILD_ATTEMPT + 1))
    [ $BUILD_ATTEMPT -gt 1 ] && echo -e "${YELLOW}Build attempt $BUILD_ATTEMPT/$MAX_BUILD_ATTEMPTS...${NC}"

    if [ "$PARALLEL" = true ]; then
        echo -e "${YELLOW}Parallel build (uses more RAM)...${NC}"
        docker compose -f "$COMPOSE_FILE" build --parallel "${SERVICES[@]}" && BUILD_OK=true && break
    else
        # Build each service individually to avoid bandwidth contention
        ALL_OK=true
        for svc in "${SERVICES[@]}"; do
            echo -e "${YELLOW}Building $svc...${NC}"
            if ! docker compose -f "$COMPOSE_FILE" build "$svc"; then
                echo -e "${RED}Failed: $svc${NC}"
                ALL_OK=false
                break
            fi
            echo -e "${GREEN}Done: $svc${NC}"
        done
        [ "$ALL_OK" = true ] && BUILD_OK=true && break
    fi

    if [ $BUILD_ATTEMPT -lt $MAX_BUILD_ATTEMPTS ]; then
        WAIT=$(( BUILD_ATTEMPT * 10 ))
        echo -e "${YELLOW}Build failed (attempt $BUILD_ATTEMPT/$MAX_BUILD_ATTEMPTS), retrying in ${WAIT}s...${NC}"
        sleep $WAIT
    fi
done

if [ "$BUILD_OK" != "true" ]; then
    echo -e "${RED}Build failed after $MAX_BUILD_ATTEMPTS attempts${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Build complete!${NC}"
echo ""
echo "Start with: ./start-stack.sh"
echo "Or:         docker compose -f $COMPOSE_FILE up -d ${SERVICES[*]}"
