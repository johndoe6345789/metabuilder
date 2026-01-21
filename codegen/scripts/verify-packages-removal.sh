#!/bin/bash

# Packages Folder Removal Verification Script
# This script verifies that all packages folder dependencies have been removed

set -e

echo "🔍 Verifying packages folder removal..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check 1: Verify packages folder is in .dockerignore
echo "📋 Checking .dockerignore..."
if grep -q "^packages$" .dockerignore; then
    echo -e "${GREEN}✓${NC} packages folder is in .dockerignore"
else
    echo -e "${RED}✗${NC} packages folder is NOT in .dockerignore"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 2: Verify Dockerfile doesn't reference packages
echo "📋 Checking Dockerfile..."
if grep -q "packages" Dockerfile; then
    echo -e "${RED}✗${NC} Dockerfile still references packages folder"
    grep -n "packages" Dockerfile
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓${NC} Dockerfile doesn't reference packages folder"
fi
echo ""

# Check 3: Verify package.json doesn't have workspace references
echo "📋 Checking package.json..."
if grep -q "workspace:" package.json; then
    echo -e "${RED}✗${NC} package.json still has workspace: protocol references"
    grep -n "workspace:" package.json
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓${NC} package.json doesn't have workspace: references"
fi
echo ""

# Check 4: Check for any imports from @github/spark or @local/spark-wrapper
echo "📋 Checking for old package imports in source code..."
OLD_IMPORTS=$(find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "@github/spark\|@local/spark" {} \; 2>/dev/null || true)
if [ -n "$OLD_IMPORTS" ]; then
    echo -e "${RED}✗${NC} Found old package imports:"
    echo "$OLD_IMPORTS"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓${NC} No old package imports found"
fi
echo ""

# Check 5: Verify storage service exists
echo "📋 Checking storage service..."
if [ -f "src/lib/storage-service.ts" ]; then
    echo -e "${GREEN}✓${NC} storage-service.ts exists"
else
    echo -e "${RED}✗${NC} storage-service.ts is missing"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 6: Verify spark library exists
echo "📋 Checking spark library..."
if [ -f "src/lib/spark/index.ts" ]; then
    echo -e "${GREEN}✓${NC} spark/index.ts exists"
else
    echo -e "${RED}✗${NC} spark/index.ts is missing"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 7: Verify useKV hook exists
echo "📋 Checking useKV hook..."
if [ -f "src/hooks/use-kv.ts" ]; then
    echo -e "${GREEN}✓${NC} use-kv.ts exists"
else
    echo -e "${RED}✗${NC} use-kv.ts is missing"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 8: Verify StorageSettings component exists
echo "📋 Checking StorageSettings component..."
if [ -f "src/components/StorageSettings.tsx" ]; then
    echo -e "${GREEN}✓${NC} StorageSettings.tsx exists"
else
    echo -e "${YELLOW}⚠${NC} StorageSettings.tsx not found (optional)"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "The packages folder can be safely removed:"
    echo "  rm -rf packages"
    echo ""
    echo "Next steps:"
    echo "  1. Test the build: npm run build"
    echo "  2. Test Docker build: docker build -t codeforge ."
    echo "  3. Commit the changes"
else
    echo -e "${RED}❌ $ERRORS error(s) found${NC}"
    echo "Please fix the errors above before removing the packages folder"
    exit 1
fi
