#!/bin/bash

# GitHub Actions Local Testing Script
# Uses 'act' to run workflows locally and diagnose issues

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  GitHub Actions Local Test with Act   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
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

echo -e "${GREEN}✓ Act is installed ($(act --version))${NC}"

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}✗ Docker is not running${NC}"
    echo "Please start Docker and try again"
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Function to run a job and capture result
run_job() {
    local job_name=$1
    local job_description=$2
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Testing: ${job_description}${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if act -j "$job_name" --env ACT=true -P ubuntu-latest=catthehacker/ubuntu:act-latest 2>&1 | tee /tmp/act_output_$job_name.log; then
        echo -e "${GREEN}✓ $job_description passed${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}✗ $job_description failed${NC}"
        echo -e "${YELLOW}Check /tmp/act_output_$job_name.log for details${NC}"
        echo ""
        return 1
    fi
}

# Show menu
echo "Select what to test:"
echo ""
echo "  1) List all workflows"
echo "  2) Dry run (show what would run)"
echo "  3) Test Prisma setup"
echo "  4) Test linting"
echo "  5) Test build"
echo "  6) Test E2E tests"
echo "  7) Run full CI pipeline"
echo "  8) Run all with verbose output"
echo "  9) Diagnose issues"
echo "  0) Exit"
echo ""
read -p "Enter choice [0-9]: " choice

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
        act -n push
        ;;
    3)
        run_job "prisma-check" "Prisma Setup"
        ;;
    4)
        run_job "lint" "Linting"
        ;;
    5)
        run_job "build" "Build"
        ;;
    6)
        run_job "test-e2e" "E2E Tests"
        ;;
    7)
        echo ""
        echo -e "${YELLOW}Running full CI pipeline...${NC}"
        echo ""
        
        failed_jobs=()
        
        if run_job "prisma-check" "Prisma Setup"; then
            :
        else
            failed_jobs+=("prisma-check")
        fi
        
        if run_job "lint" "Linting"; then
            :
        else
            failed_jobs+=("lint")
        fi
        
        if run_job "build" "Build"; then
            :
        else
            failed_jobs+=("build")
        fi
        
        if run_job "test-e2e" "E2E Tests"; then
            :
        else
            failed_jobs+=("test-e2e")
        fi
        
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}Summary${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        
        if [ ${#failed_jobs[@]} -eq 0 ]; then
            echo -e "${GREEN}✓ All jobs passed!${NC}"
        else
            echo -e "${RED}✗ Failed jobs: ${failed_jobs[*]}${NC}"
            echo ""
            echo "Check the log files in /tmp/ for details"
        fi
        ;;
    8)
        echo ""
        echo -e "${YELLOW}Running with verbose output...${NC}"
        echo ""
        act push -v --env ACT=true -P ubuntu-latest=catthehacker/ubuntu:act-latest
        ;;
    9)
        echo ""
        echo -e "${BLUE}Running diagnostics...${NC}"
        echo ""
        
        # Check package.json
        if [ -f "package.json" ]; then
            echo -e "${GREEN}✓ package.json exists${NC}"
            
            # Check for required scripts
            if grep -q '"test:e2e"' package.json; then
                echo -e "${GREEN}✓ test:e2e script found${NC}"
            else
                echo -e "${RED}✗ test:e2e script missing in package.json${NC}"
            fi
            
            if grep -q '"lint"' package.json; then
                echo -e "${GREEN}✓ lint script found${NC}"
            else
                echo -e "${RED}✗ lint script missing in package.json${NC}"
            fi
            
            if grep -q '"build"' package.json; then
                echo -e "${GREEN}✓ build script found${NC}"
            else
                echo -e "${RED}✗ build script missing in package.json${NC}"
            fi
            
            # Check for Prisma
            if grep -q '"@prisma/client"' package.json; then
                echo -e "${GREEN}✓ @prisma/client dependency found${NC}"
            else
                echo -e "${RED}✗ @prisma/client dependency missing${NC}"
            fi
            
            if grep -q '"prisma"' package.json; then
                echo -e "${GREEN}✓ prisma dependency found${NC}"
            else
                echo -e "${RED}✗ prisma dependency missing${NC}"
            fi
            
            # Check for Playwright
            if grep -q '"@playwright/test"' package.json; then
                echo -e "${GREEN}✓ @playwright/test dependency found${NC}"
            else
                echo -e "${RED}✗ @playwright/test dependency missing${NC}"
            fi
        else
            echo -e "${RED}✗ package.json not found${NC}"
        fi
        
        echo ""
        
        # Check Prisma setup
        if [ -d "prisma" ]; then
            echo -e "${GREEN}✓ prisma directory exists${NC}"
            
            if [ -f "prisma/schema.prisma" ]; then
                echo -e "${GREEN}✓ prisma/schema.prisma exists${NC}"
            else
                echo -e "${RED}✗ prisma/schema.prisma missing${NC}"
            fi
        else
            echo -e "${RED}✗ prisma directory missing${NC}"
        fi
        
        echo ""
        
        # Check node_modules
        if [ -d "node_modules" ]; then
            echo -e "${GREEN}✓ node_modules exists${NC}"
        else
            echo -e "${YELLOW}⚠ node_modules missing - run 'npm install'${NC}"
        fi
        
        echo ""
        
        # Check Playwright config
        if [ -f "playwright.config.ts" ]; then
            echo -e "${GREEN}✓ playwright.config.ts exists${NC}"
        else
            echo -e "${RED}✗ playwright.config.ts missing${NC}"
        fi
        
        echo ""
        
        # Check workflow files
        if [ -d ".github/workflows" ]; then
            echo -e "${GREEN}✓ .github/workflows directory exists${NC}"
            echo "  Workflow files:"
            ls -1 .github/workflows/*.yml 2>/dev/null | while read file; do
                echo "    - $(basename $file)"
            done
        else
            echo -e "${RED}✗ .github/workflows directory missing${NC}"
        fi
        
        echo ""
        echo -e "${BLUE}Diagnostic complete${NC}"
        ;;
    0)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}Done!${NC}"
