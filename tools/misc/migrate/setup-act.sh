#!/usr/bin/env bash

# MetaBuilder Act - Quick Start Script
# Run this to set up and test act integration
# Usage: bash setup-act.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  MetaBuilder - Act Integration Quick Start            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Check prerequisites
echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"
echo ""

# Check act
if command -v act &> /dev/null; then
    echo -e "${GREEN}✓ act is installed${NC} ($(act --version))"
else
    echo -e "${RED}✗ act is not installed${NC}"
    echo ""
    echo "Install using:"
    echo "  macOS:   brew install act"
    echo "  Linux:   curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash"
    echo "  Windows: choco install act-cli"
    echo ""
    exit 1
fi

# Check Docker
if docker info &> /dev/null; then
    echo -e "${GREEN}✓ Docker is running${NC}"
else
    echo -e "${RED}✗ Docker is not running${NC}"
    echo "Please start Docker and try again"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✓ npm is installed${NC} (v$(npm --version))"
else
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi

echo ""

# Step 2: Run diagnostics
echo -e "${YELLOW}Step 2: Running workflow diagnostics (no Docker)...${NC}"
echo ""

if [ -x "scripts/diagnose-workflows.sh" ]; then
    ./scripts/diagnose-workflows.sh
else
    chmod +x scripts/diagnose-workflows.sh
    ./scripts/diagnose-workflows.sh
fi

echo ""

# Step 3: Test basic act command
echo -e "${YELLOW}Step 3: Testing act with dry-run...${NC}"
echo ""

echo "Running: act -n (preview mode)"
if act -n push -W .github/workflows/ci.yml -P ubuntu-latest=catthehacker/ubuntu:act-latest 2>&1 | head -20; then
    echo -e "${GREEN}✓ Dry-run successful - workflows are valid${NC}"
else
    echo -e "${RED}✗ Dry-run failed - check configuration${NC}"
    exit 1
fi

echo ""

# Step 4: Setup secrets (optional)
echo -e "${YELLOW}Step 4: Secrets configuration (optional)${NC}"
echo ""

if [ ! -f ".secrets" ]; then
    echo "To use GitHub secrets, create a .secrets file:"
    echo "  cp .secrets.example .secrets"
    echo "  # Edit .secrets with your GitHub token"
    echo ""
    echo "Then use: act --secret-file .secrets"
fi

echo ""

# Step 5: Show quick commands
echo -e "${YELLOW}Step 5: Ready to use!${NC}"
echo ""
echo -e "${BLUE}Quick commands:${NC}"
echo ""
echo -e "  ${GREEN}npm run act:lint${NC}        # Test linting (2-3 min)"
echo -e "  ${GREEN}npm run act:build${NC}       # Test build (3-5 min)"
echo -e "  ${GREEN}npm run act:e2e${NC}         # Test e2e tests (4-6 min)"
echo -e "  ${GREEN}npm run act${NC}             # Full CI pipeline (8-15 min)"
echo ""
echo -e "  ${GREEN}npm run act:test${NC}        # Interactive menu"
echo -e "  ${GREEN}npm run act:diagnose${NC}    # Check setup"
echo ""

# Step 6: Offer to run a test
echo -e "${YELLOW}Step 6: Run a test?${NC}"
echo ""
read -p "Run npm run act:lint now? (y/n): " run_test

if [ "$run_test" = "y" ] || [ "$run_test" = "Y" ]; then
    echo ""
    npm run act:lint
else
    echo ""
    echo -e "${GREEN}Setup complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Read: docs/guides/ACT_CHEAT_SHEET.md"
    echo "  2. Test: npm run act:lint"
    echo "  3. Push with confidence: npm run act"
    echo ""
fi
