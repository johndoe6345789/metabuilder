#!/bin/bash

# Smoke Test Validation Script
# This script validates that the test environment is properly configured

echo "=================================================="
echo "  CodeForge Smoke Test Validation"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check Node.js
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
    ERRORS=$((ERRORS + 1))
fi

# Check npm
echo "Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm installed: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
    ERRORS=$((ERRORS + 1))
fi

# Check package.json exists
echo "Checking package.json..."
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json found"
else
    echo -e "${RED}✗${NC} package.json not found"
    ERRORS=$((ERRORS + 1))
fi

# Check if playwright is installed
echo "Checking Playwright..."
if npm list @playwright/test &> /dev/null; then
    PLAYWRIGHT_VERSION=$(npm list @playwright/test | grep @playwright/test | awk '{print $2}')
    echo -e "${GREEN}✓${NC} Playwright installed: $PLAYWRIGHT_VERSION"
else
    echo -e "${RED}✗${NC} Playwright not installed. Run: npm install"
    ERRORS=$((ERRORS + 1))
fi

# Check if playwright config exists
echo "Checking Playwright configuration..."
if [ -f "playwright.config.ts" ]; then
    echo -e "${GREEN}✓${NC} playwright.config.ts found"
else
    echo -e "${RED}✗${NC} playwright.config.ts not found"
    ERRORS=$((ERRORS + 1))
fi

# Check if smoke test file exists
echo "Checking smoke test file..."
if [ -f "e2e/smoke.spec.ts" ]; then
    echo -e "${GREEN}✓${NC} e2e/smoke.spec.ts found"
    TEST_COUNT=$(grep -c "^  test(" e2e/smoke.spec.ts)
    echo "   Found $TEST_COUNT smoke tests"
else
    echo -e "${RED}✗${NC} e2e/smoke.spec.ts not found"
    ERRORS=$((ERRORS + 1))
fi

# Check if npm script exists
echo "Checking npm test scripts..."
if grep -q '"test:e2e:smoke"' package.json; then
    echo -e "${GREEN}✓${NC} test:e2e:smoke script found"
else
    echo -e "${RED}✗${NC} test:e2e:smoke script not found in package.json"
    ERRORS=$((ERRORS + 1))
fi

# Check if dev script exists
echo "Checking dev server script..."
if grep -q '"dev"' package.json; then
    echo -e "${GREEN}✓${NC} dev script found"
else
    echo -e "${RED}✗${NC} dev script not found in package.json"
    ERRORS=$((ERRORS + 1))
fi

# Check port 5173 availability
echo "Checking port 5173 availability..."
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} Port 5173 is in use (dev server might be running)"
else
    echo -e "${GREEN}✓${NC} Port 5173 is available"
fi

# Check if Playwright browsers are installed
echo "Checking Playwright browsers..."
if [ -d "$HOME/.cache/ms-playwright" ] || [ -d "$HOME/Library/Caches/ms-playwright" ]; then
    echo -e "${GREEN}✓${NC} Playwright browsers appear to be installed"
else
    echo -e "${YELLOW}⚠${NC} Playwright browsers may not be installed"
    echo "   Run: npx playwright install"
fi

# Check src directory exists
echo "Checking source directory..."
if [ -d "src" ]; then
    echo -e "${GREEN}✓${NC} src/ directory found"
    if [ -f "src/App.tsx" ]; then
        echo -e "${GREEN}✓${NC} src/App.tsx found"
    else
        echo -e "${RED}✗${NC} src/App.tsx not found"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗${NC} src/ directory not found"
    ERRORS=$((ERRORS + 1))
fi

# Check index.html exists
echo "Checking index.html..."
if [ -f "index.html" ]; then
    echo -e "${GREEN}✓${NC} index.html found"
else
    echo -e "${RED}✗${NC} index.html not found"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "=================================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All validation checks passed!${NC}"
    echo ""
    echo "You can now run smoke tests with:"
    echo "  npm run test:e2e:smoke"
    echo ""
    echo "Other test commands:"
    echo "  npm run test:e2e:ui       # Interactive UI mode"
    echo "  npm run test:e2e:headed   # Watch tests run"
    echo "  npm run test:e2e:debug    # Debug mode"
    echo "  npm run test:e2e          # Full test suite"
else
    echo -e "${RED}✗ $ERRORS validation check(s) failed${NC}"
    echo ""
    echo "Please fix the issues above before running tests."
    echo ""
    echo "Common fixes:"
    echo "  npm install                    # Install dependencies"
    echo "  npx playwright install         # Install browsers"
fi
echo "=================================================="

exit $ERRORS
