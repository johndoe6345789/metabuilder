#!/bin/bash

# GitHub Actions Local Testing Script
# Uses 'act' to run workflows locally and diagnose issues
# 
# Features:
# - Interactive menu for testing workflows
# - Persistent log files for debugging
# - Performance metrics and timing
# - Cache awareness and suggestions
# - Detailed diagnostics

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Performance tracking
START_TIME=$(date +%s)
LOG_DIR="/tmp/act-logs"
SESSION_LOG="${LOG_DIR}/session-$(date +%Y%m%d_%H%M%S).log"
mkdir -p "$LOG_DIR"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     GitHub Actions Local Testing with Act              ║${NC}"
echo -e "${BLUE}║     High-Performance Workflow Validation                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Session: $(date '+%Y-%m-%d %H:%M:%S')"
echo "Logs: $SESSION_LOG"
echo ""

# Check if act is installed
if ! command -v act &> /dev/null; then
    echo -e "${RED}✗ Act is not installed${NC}"
    echo ""
    echo "Install act:"
    echo "  macOS:   brew install act"
    echo "  Linux:   curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash"
    echo "  Windows: choco install act-cli"
    echo ""
    echo "Or visit: https://github.com/nektos/act"
    exit 1
fi

echo -e "${GREEN}✓ Act installed: $(act --version)${NC}"

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}✗ Docker is not running${NC}"
    echo "Please start Docker and try again"
    exit 1
fi

echo -e "${GREEN}✓ Docker running${NC}"

# Check for Docker image cache
if docker images | grep -q "catthehacker/ubuntu"; then
    echo -e "${CYAN}✓ Docker image cached (fast runs)${NC}"
else
    echo -e "${YELLOW}⚠️  Docker image not cached (first run will take 5-10 min)${NC}"
fi

echo ""
# Helper function to run a job and capture result
run_job() {
    local job_name=$1
    local job_description=$2
    local start=$(date +%s)
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Testing: ${job_description}${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if act -j "$job_name" --env ACT=true -P ubuntu-latest=catthehacker/ubuntu:act-latest 2>&1 | tee -a "$SESSION_LOG"; then
        local end=$(date +%s)
        local duration=$((end - start))
        echo -e "${GREEN}✓ $job_description passed (${duration}s)${NC}"
        echo ""
        return 0
    else
        local end=$(date +%s)
        local duration=$((end - start))
        echo -e "${RED}✗ $job_description failed (${duration}s)${NC}"
        echo -e "${YELLOW}Check session log: $SESSION_LOG${NC}"
        echo ""
        return 1
    fi
}

# Show interactive menu
show_menu() {
    echo ""
    echo -e "${CYAN}Select what to test:${NC}"
    echo ""
    echo "  ${BLUE}Quick Tests:${NC}"
    echo "    1) List all workflows and jobs"
    echo "    2) Dry run (preview without execution)"
    echo "    3) Test Prisma database setup"
    echo ""
    echo "  ${BLUE}Individual Components:${NC}"
    echo "    4) Test linting (ESLint)"
    echo "    5) Test build (production)"
    echo "    6) Test E2E tests (Playwright)"
    echo ""
    echo "  ${BLUE}Full Pipeline:${NC}"
    echo "    7) Run full CI pipeline (all tests)"
    echo "    8) Run with verbose output"
    echo ""
    echo "  ${BLUE}Utilities:${NC}"
    echo "    9) Run diagnostics (no Docker)"
    echo "    10) View logs"
    echo "    0) Exit"
    echo ""
}

# Main interactive loop
while true; do
    show_menu
    read -p "Enter choice [0-10]: " choice
    
    case $choice in
        1)
            echo ""
            echo -e "${BLUE}Available workflows and jobs:${NC}"
            echo ""
            act -l
            ;;
        2)
            echo ""
            echo -e "${BLUE}Dry run - showing what would execute:${NC}"
            echo ""
            act -n push -P ubuntu-latest=catthehacker/ubuntu:act-latest
            ;;
        3)
            run_job "prisma-check" "Prisma Database Setup"
            ;;
        4)
            run_job "lint" "ESLint Linting"
            ;;
        5)
            run_job "build" "Production Build"
            ;;
        6)
            run_job "test-e2e" "End-to-End Tests (Playwright)"
            ;;
        7)
            echo ""
            echo -e "${YELLOW}Running full CI pipeline...${NC}"
            echo ""
            
            failed_jobs=()
            total_start=$(date +%s)
            
            run_job "prisma-check" "Prisma Setup" || failed_jobs+=("prisma-check")
            run_job "lint" "Linting" || failed_jobs+=("lint")
            run_job "build" "Build" || failed_jobs+=("build")
            run_job "test-e2e" "E2E Tests" || failed_jobs+=("test-e2e")
            
            total_end=$(date +%s)
            total_duration=$((total_end - total_start))
            
            echo ""
            echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "${BLUE}Pipeline Summary${NC}"
            echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            
            if [ ${#failed_jobs[@]} -eq 0 ]; then
                echo -e "${GREEN}✓ All jobs passed! (${total_duration}s total)${NC}"
                echo ""
                echo -e "${CYAN}✨ Ready to push to GitHub!${NC}"
            else
                echo -e "${RED}✗ Failed jobs: ${failed_jobs[*]}${NC}"
                echo ""
                echo "Troubleshooting:"
                echo "  1. Check session log: $SESSION_LOG"
                echo "  2. Run: npm run act:diagnose"
                echo "  3. Review: docs/guides/ACT_TESTING.md"
            fi
            ;;
        8)
            echo ""
            echo -e "${YELLOW}Running with verbose output...${NC}"
            echo ""
            act push -v --env ACT=true -P ubuntu-latest=catthehacker/ubuntu:act-latest 2>&1 | tee -a "$SESSION_LOG"
            ;;
        9)
            echo ""
            echo -e "${BLUE}Running diagnostics (no Docker required)...${NC}"
            echo ""
            
            if [ -x "scripts/diagnose-workflows.sh" ]; then
                ./scripts/diagnose-workflows.sh
            else
                chmod +x scripts/diagnose-workflows.sh
                ./scripts/diagnose-workflows.sh
            fi
            ;;
        10)
            echo ""
            echo -e "${BLUE}Recent log files:${NC}"
            echo ""
            ls -lhrt /tmp/act-logs/ | tail -10
            echo ""
            read -p "View latest log? (y/n): " view_log
            if [ "$view_log" = "y" ]; then
                latest_log=$(ls -tr /tmp/act-logs/*.log 2>/dev/null | tail -1)
                if [ -n "$latest_log" ]; then
                    less "$latest_log"
                fi
            fi
            ;;
        0)
            echo ""
            echo -e "${GREEN}Exiting${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Please enter 0-10.${NC}"
            ;;
    esac
done
