#!/usr/bin/env bash
# Wrapper script to run act with proper configuration

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Default workflow file
WORKFLOW="${WORKFLOW:-ci.yml}"

# Check if act is installed
if ! command -v act &> /dev/null; then
    echo "❌ act is not installed"
    echo "   Install with: brew install act"
    exit 1
fi

# Parse arguments
ACT_ARGS=()
WORKFLOW_FILE=""
JOB=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -w|--workflow)
            WORKFLOW_FILE="$2"
            shift 2
            ;;
        -j|--job)
            JOB="$2"
            shift 2
            ;;
        *)
            ACT_ARGS+=("$1")
            shift
            ;;
    esac
done

# Set workflow file
if [ -n "$WORKFLOW_FILE" ]; then
    WORKFLOW="$WORKFLOW_FILE"
fi

# Build act command
ACT_CMD=(act)

# Add workflow file if specified
if [ -n "$WORKFLOW" ]; then
    ACT_CMD+=(-W "$PROJECT_ROOT/.github/workflows/$WORKFLOW")
fi

# Add job if specified
if [ -n "$JOB" ]; then
    ACT_CMD+=(-j "$JOB")
fi

# Add platform specification for better compatibility
ACT_CMD+=(-P ubuntu-latest=catthehacker/ubuntu:act-latest)

# Add any additional arguments
ACT_CMD+=("${ACT_ARGS[@]}")

# Add secrets file if it exists
if [ -f "$PROJECT_ROOT/.secrets" ]; then
    ACT_CMD+=(--secret-file "$PROJECT_ROOT/.secrets")
fi

# Add env file if it exists
if [ -f "$PROJECT_ROOT/.env" ]; then
    ACT_CMD+=(--env-file "$PROJECT_ROOT/.env")
fi

# Run act
echo "🏃 Running: ${ACT_CMD[*]}"
echo
"${ACT_CMD[@]}"
