#!/usr/bin/env bash
# Bump patch version, commit, push, and redeploy a MetaBuilder frontend.
#
# Usage:
#   ./release.sh pastebin           Bump patch (0.8.1 → 0.8.2)
#   ./release.sh pastebin minor     Bump minor (0.8.1 → 0.9.0)
#   ./release.sh pastebin major     Bump major (0.8.1 → 1.0.0)
#   ./release.sh pastebin 1.2.3     Set exact version

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.stack.yml"

APP="${1:-}"
BUMP="${2:-patch}"

if [[ -z "$APP" ]]; then
    echo -e "${RED}Usage: $0 <app> [patch|minor|major|x.y.z]${NC}"
    echo "  Apps: pastebin, workflowui, codegen, emailclient, ..."
    exit 1
fi

# Resolve package.json path
PKG_PATHS=(
    "$REPO_ROOT/frontends/$APP/package.json"
    "$REPO_ROOT/$APP/package.json"
)
PKG=""
for p in "${PKG_PATHS[@]}"; do
    [[ -f "$p" ]] && PKG="$p" && break
done

if [[ -z "$PKG" ]]; then
    echo -e "${RED}Cannot find package.json for '$APP'${NC}"
    exit 1
fi

# Read current version
CURRENT=$(node -p "require('$PKG').version")

# Compute next version
if [[ "$BUMP" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    NEXT="$BUMP"
else
    IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"
    case "$BUMP" in
        major) NEXT="$((MAJOR + 1)).0.0" ;;
        minor) NEXT="${MAJOR}.$((MINOR + 1)).0" ;;
        patch) NEXT="${MAJOR}.${MINOR}.$((PATCH + 1))" ;;
        *)
            echo -e "${RED}Unknown bump type '$BUMP'. Use patch, minor, major, or x.y.z${NC}"
            exit 1
            ;;
    esac
fi

echo -e "${CYAN}Releasing $APP: ${YELLOW}$CURRENT${CYAN} → ${GREEN}$NEXT${NC}"

# Update package.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('$PKG', 'utf8'));
pkg.version = '$NEXT';
fs.writeFileSync('$PKG', JSON.stringify(pkg, null, 2) + '\n');
"

# Commit and push
cd "$REPO_ROOT"
git add "$PKG"
git commit -m "chore: bump $APP to v$NEXT

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
git push origin main

echo -e "${CYAN}Building and deploying $APP...${NC}"
cd "$SCRIPT_DIR"
docker compose -f "$COMPOSE_FILE" up -d --build "$APP"

echo -e "${GREEN}✓ $APP v$NEXT deployed${NC}"
