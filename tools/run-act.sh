#!/bin/bash

# Script to run GitHub Actions workflows locally using act
# https://github.com/nektos/act
#
# Features:
# - Validates act and Docker installation
# - Supports .actrc for configuration
# - Logs output to /tmp for debugging
# - Suggests performance optimizations
# - Color-coded output for easy reading

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log file for debugging
LOG_DIR="/tmp/act-logs"
LOG_FILE="${LOG_DIR}/act-$(date +%Y%m%d_%H%M%S).log"
mkdir -p "$LOG_DIR"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}GitHub Actions Local Runner (act)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if act is installed
if ! command -v act &> /dev/null; then
    echo -e "${RED}✗ Error: 'act' is not installed.${NC}"
    echo ""
    echo -e "${YELLOW}Install act using one of these methods:${NC}"
    echo ""
    echo "  macOS (Homebrew):"
    echo "    brew install act"
    echo ""
    echo "  Linux (using curl):"
    echo "    curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash"
    echo ""
    echo "  Windows (using Chocolatey):"
    echo "    choco install act-cli"
    echo ""
    echo "  Or via GitHub releases:"
    echo "    https://github.com/nektos/act/releases"
    echo ""
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}✗ Error: Docker is not running.${NC}"
    echo ""
    echo -e "${YELLOW}Start Docker:${NC}"
    echo "  - macOS/Windows: Open Docker Desktop"
    echo "  - Linux: systemctl start docker"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ act is installed${NC} ($(act --version))"
echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Default values
WORKFLOW="ci.yml"
JOB=""
EVENT="push"
PLATFORM=""
DRY_RUN=false
SAVE_LOGS=true

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -w|--workflow)
            WORKFLOW="$2"
            shift 2
            ;;
        -j|--job)
            JOB="$2"
            shift 2
            ;;
        -e|--event)
            EVENT="$2"
            shift 2
            ;;
        -p|--platform)
            PLATFORM="$2"
            shift 2
            ;;
        -n|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -l|--list)
            echo "Available workflows:"
            ls -1 .github/workflows/*.yml .github/workflows/*.yaml 2>/dev/null | sed 's|.github/workflows/||'
            echo ""
            echo "Usage examples:"
            echo "  npm run act                  # Run all CI jobs"
            echo "  npm run act:lint            # Run linting only"
            echo "  npm run act:build           # Run build only"
            echo "  npm run act:e2e             # Run e2e tests only"
            echo "  npm run act:all             # Run full CI pipeline"
            echo ""
            echo "Direct act commands:"
            echo "  $0 -w ci.yml -j lint       # Run specific job"
            echo "  $0 -n                      # Dry run (preview)"
            exit 0
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -w, --workflow <file>    Workflow file to run (default: ci.yml)"
            echo "  -j, --job <name>         Specific job to run (runs all jobs if not specified)"
            echo "  -e, --event <event>      Event type to simulate (default: push)"
            echo "  -p, --platform <image>   Docker platform/image to use"
            echo "  -n, --dry-run            Preview steps without executing"
            echo "  -l, --list               List available workflows"
            echo "  -h, --help               Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                              # Run default CI workflow"
            echo "  $0 -w ci.yml -j lint            # Run only the lint job"
            echo "  $0 -w ci.yml -j test-e2e        # Run only e2e tests"
            echo "  $0 -e pull_request              # Simulate a pull request event"
            echo "  $0 -n                           # Dry run (preview only)"
            echo ""
            echo "Performance Tips:"
            echo "  - First run downloads Docker image (~2-5GB), takes 5-10 minutes"
            echo "  - Subsequent runs are much faster (cached layers)"
            echo "  - Use -j to test specific jobs faster"
            echo "  - Use -n to preview without executing"
            echo ""
            echo "View logs: tail -f /tmp/act-logs/*.log"
            echo ""
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Check if workflow file exists
WORKFLOW_PATH=".github/workflows/${WORKFLOW}"
if [ ! -f "$WORKFLOW_PATH" ]; then
    echo -e "${RED}✗ Error: Workflow file not found: $WORKFLOW_PATH${NC}"
    echo ""
    echo "Available workflows:"
    ls -1 .github/workflows/*.yml .github/workflows/*.yaml 2>/dev/null | sed 's|.github/workflows/||'
    exit 1
fi

# Build act command
ACT_CMD="act $EVENT -W $WORKFLOW_PATH"

if [ -n "$JOB" ]; then
    ACT_CMD="$ACT_CMD -j $JOB"
fi

if [ "$DRY_RUN" = true ]; then
    ACT_CMD="$ACT_CMD -n"
fi

if [ -n "$PLATFORM" ]; then
    ACT_CMD="$ACT_CMD -P ubuntu-latest=$PLATFORM"
fi

# Always use verbose for better debugging
ACT_CMD="$ACT_CMD --verbose"

# Display what we're about to run
echo -e "${YELLOW}Configuration:${NC}"
echo "  Workflow: $WORKFLOW"
if [ -n "$JOB" ]; then
    echo "  Job:      $JOB"
fi
echo "  Event:    $EVENT"
if [ "$DRY_RUN" = true ]; then
    echo "  Mode:     DRY RUN (preview only)"
fi
echo ""

echo -e "${YELLOW}Command: $ACT_CMD${NC}"
echo ""

# Show first-run tip
if [ ! -f "$HOME/.act/actions_cache" ] && [ "$DRY_RUN" = false ]; then
    echo -e "${BLUE}💡 Tip: First run will download Docker image (~2-5GB).${NC}"
    echo -e "${BLUE}   This takes 5-10 minutes, but subsequent runs are faster.${NC}"
    echo ""
fi

if [ "$DRY_RUN" = false ]; then
    echo "Press Ctrl+C to cancel..."
    echo ""
fi

# Run act and capture output
if [ "$SAVE_LOGS" = true ] && [ "$DRY_RUN" = false ]; then
    echo -e "${BLUE}Logs: $LOG_FILE${NC}"
    echo ""
    eval $ACT_CMD 2>&1 | tee "$LOG_FILE"
else
    eval $ACT_CMD
fi

EXIT_CODE=${PIPESTATUS[0]}

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}✗ Test failed with exit code $EXIT_CODE${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    if [ "$SAVE_LOGS" = true ]; then
        echo "View logs: $LOG_FILE"
    fi
fi

echo ""

exit $EXIT_CODE
