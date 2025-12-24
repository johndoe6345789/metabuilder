#!/bin/bash

# Script to run GitHub Actions workflows locally using act
# https://github.com/nektos/act

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}GitHub Actions Local Runner (act)${NC}"
echo "======================================"
echo ""

# Check if act is installed
if ! command -v act &> /dev/null; then
    echo -e "${RED}Error: 'act' is not installed.${NC}"
    echo ""
    echo "Install act using one of these methods:"
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

# Default values
WORKFLOW="ci.yml"
JOB=""
EVENT="push"
PLATFORM=""

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
        -l|--list)
            echo "Available workflows:"
            ls -1 .github/workflows/*.yml .github/workflows/*.yaml 2>/dev/null | sed 's|.github/workflows/||'
            echo ""
            echo "To run a workflow:"
            echo "  $0 -w ci.yml"
            echo ""
            echo "To list jobs in a workflow:"
            echo "  act -l -W .github/workflows/ci.yml"
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
            echo "  -l, --list               List available workflows"
            echo "  -h, --help               Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                                  # Run default CI workflow"
            echo "  $0 -w ci.yml -j lint                # Run only the lint job"
            echo "  $0 -w ci.yml -j test-e2e            # Run only e2e tests"
            echo "  $0 -e pull_request                  # Simulate a pull request event"
            echo "  $0 -p catthehacker/ubuntu:act-latest  # Use specific Docker image"
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
    echo -e "${RED}Error: Workflow file not found: $WORKFLOW_PATH${NC}"
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

if [ -n "$PLATFORM" ]; then
    ACT_CMD="$ACT_CMD -P ubuntu-latest=$PLATFORM"
fi

# Add verbose flag for better debugging
ACT_CMD="$ACT_CMD --verbose"

echo -e "${YELLOW}Running workflow: $WORKFLOW${NC}"
if [ -n "$JOB" ]; then
    echo -e "${YELLOW}Job: $JOB${NC}"
fi
echo -e "${YELLOW}Event: $EVENT${NC}"
echo ""
echo -e "${YELLOW}Command: $ACT_CMD${NC}"
echo ""
echo "Note: This will run in Docker containers and may take a while on first run."
echo "Press Ctrl+C to cancel."
echo ""

# Run act
eval $ACT_CMD

echo ""
echo -e "${GREEN}Done!${NC}"
