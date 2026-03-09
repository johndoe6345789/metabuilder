#!/bin/bash

# Delete Packages Folder Script
# This script removes the packages folder after verification

set -e

echo "🗑️  Deleting packages folder..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if packages folder exists
if [ ! -d "packages" ]; then
    echo -e "${YELLOW}⚠${NC} packages folder does not exist"
    exit 0
fi

# Run verification first
echo "Running verification checks..."
if bash scripts/verify-packages-removal.sh; then
    echo ""
    echo -e "${GREEN}✓${NC} All verification checks passed"
    echo ""
    
    # Delete the folder
    echo "Deleting packages folder..."
    rm -rf packages
    
    if [ ! -d "packages" ]; then
        echo -e "${GREEN}✅ packages folder successfully deleted${NC}"
        echo ""
        echo "Next steps:"
        echo "  1. Test the build: npm run build"
        echo "  2. Test Docker build: docker build -t codeforge ."
        echo "  3. Commit the changes: git add -A && git commit -m 'Remove packages folder'"
    else
        echo -e "${RED}❌ Failed to delete packages folder${NC}"
        exit 1
    fi
else
    echo ""
    echo -e "${RED}❌ Verification failed${NC}"
    echo "Cannot delete packages folder - fix errors first"
    exit 1
fi
