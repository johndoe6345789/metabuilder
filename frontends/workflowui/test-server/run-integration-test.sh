#!/bin/bash

###############################################################################
# WorkflowUI Integration Test Runner
# Starts mock DBAL server, workflowui dev server, runs Playwright tests
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKFLOWUI_DIR="$(dirname "$SCRIPT_DIR")"
ROOT_DIR="$(dirname "$WORKFLOWUI_DIR")"
RESULTS_DIR="$WORKFLOWUI_DIR/test-results"
LOGS_DIR="$RESULTS_DIR/logs"

MOCK_DBAL_PORT=8080
WORKFLOWUI_PORT=3000
MOCK_DBAL_PID=""
WORKFLOWUI_PID=""

# Create results directory
mkdir -p "$RESULTS_DIR"
mkdir -p "$LOGS_DIR"

###############################################################################
# CLEANUP FUNCTION
###############################################################################

cleanup() {
    echo -e "\n${YELLOW}Cleaning up...${NC}"

    if [ ! -z "$MOCK_DBAL_PID" ]; then
        echo "Stopping mock DBAL server (PID: $MOCK_DBAL_PID)..."
        kill $MOCK_DBAL_PID 2>/dev/null || true
        wait $MOCK_DBAL_PID 2>/dev/null || true
    fi

    if [ ! -z "$WORKFLOWUI_PID" ]; then
        echo "Stopping workflowui server (PID: $WORKFLOWUI_PID)..."
        kill $WORKFLOWUI_PID 2>/dev/null || true
        wait $WORKFLOWUI_PID 2>/dev/null || true
    fi

    # Kill any remaining processes on our ports
    lsof -ti:$MOCK_DBAL_PORT | xargs kill -9 2>/dev/null || true
    lsof -ti:$WORKFLOWUI_PORT | xargs kill -9 2>/dev/null || true

    echo -e "${GREEN}Cleanup complete${NC}"
}

trap cleanup EXIT

###############################################################################
# WAIT FOR SERVER
###############################################################################

wait_for_server() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=0

    echo -n "Waiting for $name to be ready"

    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e " ${GREEN}✓${NC}"
            return 0
        fi
        echo -n "."
        sleep 1
        attempt=$((attempt + 1))
    done

    echo -e " ${RED}✗${NC}"
    echo -e "${RED}Error: $name failed to start${NC}"
    return 1
}

###############################################################################
# INSTALL DEPENDENCIES
###############################################################################

echo -e "${BLUE}=== Installing Dependencies ===${NC}"

# Install test-server dependencies
cd "$SCRIPT_DIR"
if [ ! -d "node_modules" ]; then
    echo "Installing test-server dependencies..."
    npm install
fi

# Install workflowui dependencies (if needed)
cd "$WORKFLOWUI_DIR"
if [ ! -d "node_modules" ]; then
    echo "Installing workflowui dependencies..."
    npm install
fi

###############################################################################
# START MOCK DBAL SERVER
###############################################################################

echo -e "\n${BLUE}=== Starting Mock DBAL Server ===${NC}"
cd "$SCRIPT_DIR"

# Update .env to point to mock DBAL
export NEXT_PUBLIC_API_URL="http://localhost:$MOCK_DBAL_PORT"
export MOCK_DBAL_PORT=$MOCK_DBAL_PORT

npm run start > "$LOGS_DIR/mock-dbal.log" 2>&1 &
MOCK_DBAL_PID=$!

echo "Mock DBAL server starting (PID: $MOCK_DBAL_PID)..."
echo "Logs: $LOGS_DIR/mock-dbal.log"

wait_for_server "http://localhost:$MOCK_DBAL_PORT/health" "Mock DBAL server"

###############################################################################
# START WORKFLOWUI DEV SERVER
###############################################################################

echo -e "\n${BLUE}=== Starting WorkflowUI Dev Server ===${NC}"
cd "$WORKFLOWUI_DIR"

# Create temporary .env.local pointing to mock DBAL
cat > .env.local.test <<EOF
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:$MOCK_DBAL_PORT
NEXTAUTH_SECRET=test-secret
NEXTAUTH_URL=http://localhost:$WORKFLOWUI_PORT
EOF

# Start dev server with test environment
cp .env.local.test .env.local
npm run dev > "$LOGS_DIR/workflowui.log" 2>&1 &
WORKFLOWUI_PID=$!

echo "WorkflowUI dev server starting (PID: $WORKFLOWUI_PID)..."
echo "Logs: $LOGS_DIR/workflowui.log"

wait_for_server "http://localhost:$WORKFLOWUI_PORT" "WorkflowUI dev server"

###############################################################################
# RUN PLAYWRIGHT TESTS
###############################################################################

echo -e "\n${BLUE}=== Running Playwright Integration Tests ===${NC}"

cd "$ROOT_DIR"

# Check if Playwright is installed
if ! npx playwright --version > /dev/null 2>&1; then
    echo "Installing Playwright..."
    npx playwright install
fi

# Run tests
npx playwright test "$SCRIPT_DIR/integration.spec.ts" \
    --reporter=html \
    --output="$RESULTS_DIR" \
    || TEST_EXIT_CODE=$?

###############################################################################
# COLLECT RESULTS
###############################################################################

echo -e "\n${BLUE}=== Test Results ===${NC}"

# Copy screenshots and logs
if [ -d "test-results" ]; then
    cp -r test-results/* "$RESULTS_DIR/" 2>/dev/null || true
fi

if [ -d "playwright-report" ]; then
    cp -r playwright-report "$RESULTS_DIR/" 2>/dev/null || true
fi

# Display summary
echo -e "\n${GREEN}Results Location:${NC}"
echo "  Screenshots: $RESULTS_DIR/"
echo "  Logs: $LOGS_DIR/"
echo "  HTML Report: $RESULTS_DIR/playwright-report/index.html"

# Show test logs
if [ -f "$LOGS_DIR/mock-dbal.log" ]; then
    echo -e "\n${YELLOW}Mock DBAL Server Log (last 20 lines):${NC}"
    tail -20 "$LOGS_DIR/mock-dbal.log"
fi

if [ -f "$LOGS_DIR/workflowui.log" ]; then
    echo -e "\n${YELLOW}WorkflowUI Server Log (last 20 lines):${NC}"
    tail -20 "$LOGS_DIR/workflowui.log"
fi

# Exit with test exit code
if [ ! -z "$TEST_EXIT_CODE" ] && [ $TEST_EXIT_CODE -ne 0 ]; then
    echo -e "\n${RED}Tests failed with exit code $TEST_EXIT_CODE${NC}"
    exit $TEST_EXIT_CODE
fi

echo -e "\n${GREEN}✅ All tests passed!${NC}"
exit 0
