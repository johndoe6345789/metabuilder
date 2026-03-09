#!/usr/bin/env bash
# Quick build + deploy for one or more apps.
#
# Combines build-apps.sh --force + docker compose up --force-recreate
# into a single command for the most common workflow.
#
# Usage:
#   ./deploy.sh codegen              Build and deploy codegen
#   ./deploy.sh codegen pastebin     Build and deploy multiple apps
#   ./deploy.sh --all                Build and deploy all apps
#
# This replaces the manual workflow of:
#   docker compose build --no-cache codegen
#   docker compose up -d --force-recreate codegen

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.stack.yml"

ALL_APPS=(workflowui codegen pastebin postgres emailclient exploded-diagrams storybook frontend-app dbal)

# Map friendly name → compose service name
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

if [ $# -eq 0 ]; then
    echo "Usage: ./deploy.sh <app> [app2 ...] | --all"
    echo ""
    echo "Available apps: ${ALL_APPS[*]}"
    exit 1
fi

TARGETS=()
NO_CACHE=false
for arg in "$@"; do
    case "$arg" in
        --all) TARGETS=("${ALL_APPS[@]}") ;;
        --no-cache) NO_CACHE=true ;;
        *) TARGETS+=("$arg") ;;
    esac
done

# Resolve service names
SERVICES=()
for target in "${TARGETS[@]}"; do
    service="$(resolve_service "$target")"
    if [ -z "$service" ]; then
        echo -e "${RED}Unknown app: $target${NC}"
        echo "Available: ${ALL_APPS[*]}"
        exit 1
    fi
    SERVICES+=("$service")
done

echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}  Deploy: ${TARGETS[*]}${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

# Step 1: Build
echo -e "${YELLOW}[1/3] Building...${NC}"
BUILD_ARGS=()
if [ "$NO_CACHE" = true ]; then
    BUILD_ARGS+=("--no-cache")
fi
docker compose -f "$COMPOSE_FILE" build "${BUILD_ARGS[@]}" "${SERVICES[@]}"
echo ""

# Step 2: Recreate containers
echo -e "${YELLOW}[2/3] Deploying...${NC}"
docker compose -f "$COMPOSE_FILE" up -d --force-recreate "${SERVICES[@]}"
echo ""

# Step 3: Wait for health
echo -e "${YELLOW}[3/3] Waiting for health checks...${NC}"
HEALTHY=true
for service in "${SERVICES[@]}"; do
    container="metabuilder-${service}"
    # Some services use different container names
    case "$service" in
        postgres-dashboard) container="metabuilder-postgres-dashboard" ;;
        emailclient-app)    container="metabuilder-emailclient-app" ;;
    esac

    echo -n "  $service: "
    for i in $(seq 1 30); do
        status=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "missing")
        if [ "$status" = "healthy" ]; then
            echo -e "${GREEN}healthy${NC}"
            break
        elif [ "$status" = "unhealthy" ]; then
            echo -e "${RED}unhealthy${NC}"
            HEALTHY=false
            break
        fi
        sleep 2
    done
    if [ "$status" != "healthy" ] && [ "$status" != "unhealthy" ]; then
        echo -e "${YELLOW}timeout (status: $status)${NC}"
        HEALTHY=false
    fi
done
echo ""

if [ "$HEALTHY" = true ]; then
    echo -e "${GREEN}✓ All services deployed and healthy${NC}"
else
    echo -e "${YELLOW}⚠ Some services are not healthy — check with: docker compose -f $COMPOSE_FILE ps${NC}"
fi
