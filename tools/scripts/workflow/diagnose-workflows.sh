#!/bin/bash

# Quick workflow issue diagnosis script
# Identifies common problems without running act

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${MAGENTA}╔═══════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║  GitHub Actions Issue Diagnostic Report  ║${NC}"
echo -e "${MAGENTA}╚═══════════════════════════════════════════╝${NC}"
echo ""

issues_found=0
warnings_found=0

# Function to report an issue
report_issue() {
    echo -e "${RED}✗ ISSUE: $1${NC}"
    if [ -n "$2" ]; then
        echo -e "  ${YELLOW}Fix: $2${NC}"
    fi
    echo ""
    ((issues_found++))
}

# Function to report a warning
report_warning() {
    echo -e "${YELLOW}⚠ WARNING: $1${NC}"
    if [ -n "$2" ]; then
        echo -e "  Info: $2"
    fi
    echo ""
    ((warnings_found++))
}

# Function to report success
report_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

echo -e "${BLUE}Checking project structure...${NC}"
echo ""

# Check package.json
if [ ! -f "package.json" ]; then
    report_issue "package.json not found" "Create package.json with npm init"
else
    report_success "package.json exists"
    
    # Check scripts
    if ! grep -q '"lint"' package.json; then
        report_issue "lint script missing in package.json" "Add: \"lint\": \"eslint . --ext ts,tsx\""
    else
        report_success "lint script found"
    fi
    
    if ! grep -q '"build"' package.json; then
        report_issue "build script missing in package.json" "Add: \"build\": \"vite build\""
    else
        report_success "build script found"
    fi
    
    if ! grep -q '"test:e2e"' package.json; then
        report_issue "test:e2e script missing in package.json" "Add: \"test:e2e\": \"playwright test\""
    else
        report_success "test:e2e script found"
    fi
    
    echo ""
    
    # Check dependencies
    if ! grep -q '"@prisma/client"' package.json; then
        report_issue "@prisma/client missing from dependencies" "Run: npm install @prisma/client"
    else
        report_success "@prisma/client dependency found"
    fi
    
    if ! grep -q '"prisma"' package.json; then
        report_issue "prisma missing from dependencies" "Run: npm install -D prisma"
    else
        report_success "prisma dependency found"
    fi
    
    if ! grep -q '"@playwright/test"' package.json; then
        report_issue "@playwright/test missing from dependencies" "Run: npm install -D @playwright/test"
    else
        report_success "@playwright/test dependency found"
    fi
fi

echo ""
echo -e "${BLUE}Checking Prisma setup...${NC}"
echo ""

if [ ! -d "prisma" ]; then
    report_issue "prisma directory not found" "Run: npx prisma init"
else
    report_success "prisma directory exists"
    
    if [ ! -f "prisma/schema.prisma" ]; then
        report_issue "prisma/schema.prisma not found" "Run: npx prisma init"
    else
        report_success "prisma/schema.prisma exists"
        
        # Check if schema has models
        if ! grep -q "model" prisma/schema.prisma; then
            report_warning "No models defined in schema.prisma" "Add your data models"
        else
            report_success "Models found in schema"
        fi
    fi
    
    if [ -d "prisma/migrations" ]; then
        report_success "Migrations directory exists"
        migration_count=$(ls -1 prisma/migrations | wc -l)
        echo -e "  ${GREEN}Found $migration_count migration(s)${NC}"
    else
        report_warning "No migrations directory" "Run: npx prisma migrate dev --name init"
    fi
fi

echo ""
echo -e "${BLUE}Checking Playwright setup...${NC}"
echo ""

if [ ! -f "playwright.config.ts" ]; then
    report_issue "playwright.config.ts not found" "Run: npm init playwright@latest"
else
    report_success "playwright.config.ts exists"
fi

if [ -d "e2e" ]; then
    report_success "e2e directory exists"
    test_count=$(find e2e -name "*.spec.ts" -o -name "*.test.ts" | wc -l)
    if [ "$test_count" -eq 0 ]; then
        report_warning "No test files found in e2e directory" "Create test files: e2e/example.spec.ts"
    else
        echo -e "  ${GREEN}Found $test_count test file(s)${NC}"
    fi
else
    report_warning "e2e directory not found" "Create e2e tests directory"
fi

echo ""
echo -e "${BLUE}Checking node_modules...${NC}"
echo ""

if [ ! -d "node_modules" ]; then
    report_warning "node_modules directory not found" "Run: npm install"
else
    report_success "node_modules exists"
    
    # Check specific critical packages
    if [ ! -d "node_modules/@prisma/client" ]; then
        report_issue "@prisma/client not installed" "Run: npm install"
    fi
    
    if [ ! -d "node_modules/prisma" ]; then
        report_issue "prisma not installed" "Run: npm install"
    fi
    
    if [ ! -d "node_modules/@playwright/test" ]; then
        report_issue "@playwright/test not installed" "Run: npm install"
    fi
fi

echo ""
echo -e "${BLUE}Checking GitHub workflows...${NC}"
echo ""

if [ ! -d ".github/workflows" ]; then
    report_issue ".github/workflows directory not found" "Workflows not set up"
else
    report_success ".github/workflows directory exists"
    
    workflow_count=$(ls -1 .github/workflows/*.yml 2>/dev/null | wc -l)
    echo -e "  ${GREEN}Found $workflow_count workflow file(s)${NC}"
    
    # Check specific workflows
    if [ -f ".github/workflows/ci.yml" ]; then
        report_success "CI workflow exists"
        
        # Analyze CI workflow for issues
        if grep -q "prisma generate" .github/workflows/ci.yml; then
            if ! grep -q "DATABASE_URL" .github/workflows/ci.yml; then
                report_warning "prisma generate without DATABASE_URL in CI" "May cause issues"
            fi
        fi
        
        if grep -q "npm ci" .github/workflows/ci.yml; then
            report_success "Using npm ci (good practice)"
        elif grep -q "npm install" .github/workflows/ci.yml; then
            report_warning "Using npm install instead of npm ci" "Consider using npm ci for CI"
        fi
    else
        report_warning "ci.yml not found" "No CI workflow configured"
    fi
fi

echo ""
echo -e "${BLUE}Checking package-lock.json...${NC}"
echo ""

if [ ! -f "package-lock.json" ]; then
    report_warning "package-lock.json not found" "Run: npm install to generate it"
else
    report_success "package-lock.json exists"
    
    # Check if package-lock is newer than package.json
    if [ package.json -nt package-lock.json ]; then
        report_warning "package.json is newer than package-lock.json" "Run: npm install to update lockfile"
    fi
fi

echo ""
echo -e "${BLUE}Checking TypeScript setup...${NC}"
echo ""

if [ ! -f "tsconfig.json" ]; then
    report_warning "tsconfig.json not found" "TypeScript may not be configured"
else
    report_success "tsconfig.json exists"
fi

echo ""
echo -e "${BLUE}Checking environment files...${NC}"
echo ""

if [ -f ".env" ]; then
    report_success ".env file exists"
    
    if ! grep -q "DATABASE_URL" .env; then
        report_warning "DATABASE_URL not found in .env" "Prisma may need this"
    fi
else
    if [ -f ".env.example" ]; then
        report_warning ".env file missing but .env.example exists" "Copy .env.example to .env"
    else
        report_warning ".env file not found" "May be needed for local development"
    fi
fi

echo ""
echo -e "${BLUE}Checking .gitignore...${NC}"
echo ""

if [ ! -f ".gitignore" ]; then
    report_warning ".gitignore not found" "Create one to avoid committing sensitive files"
else
    report_success ".gitignore exists"
    
    critical_ignores=("node_modules" ".env" "dist")
    for ignore in "${critical_ignores[@]}"; do
        if ! grep -q "^$ignore" .gitignore; then
            report_warning "$ignore not in .gitignore" "Add to prevent committing"
        fi
    done
fi

echo ""
echo -e "${MAGENTA}═══════════════════════════════════════════${NC}"
echo -e "${MAGENTA}Summary${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════${NC}"
echo ""

if [ $issues_found -eq 0 ] && [ $warnings_found -eq 0 ]; then
    echo -e "${GREEN}✓ No issues found! Your project looks good.${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "  1. Install act: https://github.com/nektos/act"
    echo "  2. Run: ./scripts/test-workflows.sh"
    echo "  3. Or directly: act push"
elif [ $issues_found -eq 0 ]; then
    echo -e "${YELLOW}Found $warnings_found warning(s) but no critical issues.${NC}"
    echo -e "${GREEN}Your workflows should run, but consider addressing warnings.${NC}"
else
    echo -e "${RED}Found $issues_found issue(s) and $warnings_found warning(s).${NC}"
    echo ""
    echo -e "${YELLOW}Please fix the issues above before running workflows.${NC}"
    echo ""
    echo -e "${BLUE}Common fixes:${NC}"
    echo "  1. npm install                    # Install dependencies"
    echo "  2. npx prisma init                # Initialize Prisma"
    echo "  3. npm init playwright@latest     # Initialize Playwright"
    echo "  4. npm install @prisma/client     # Install Prisma client"
    echo ""
fi

echo -e "${BLUE}For detailed workflow testing, run:${NC}"
echo "  ./scripts/test-workflows.sh"
echo ""

exit $issues_found
