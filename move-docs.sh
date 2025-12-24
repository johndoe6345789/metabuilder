#!/bin/bash

# Documentation File Relocation Script
# This script organizes all documentation files from the project root into the /docs folder

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📚 Starting documentation relocation...${NC}\n"

# Navigate to project root
cd "$(dirname "$0")/.."

# Create directory structure
echo -e "${BLUE}Creating directory structure...${NC}"
mkdir -p docs/iterations
mkdir -p docs/architecture
mkdir -p docs/packages
mkdir -p docs/lua
mkdir -p docs/development
mkdir -p docs/database
mkdir -p docs/security
mkdir -p docs/reference

# Move iteration history
echo -e "\n${BLUE}Moving iteration history files...${NC}"
[ -f "COMPLETE_ITERATION_25.md" ] && mv COMPLETE_ITERATION_25.md docs/iterations/iteration-25-complete.md && echo "✓ iteration-25-complete.md"
[ -f "ITERATION_24_SUMMARY.md" ] && mv ITERATION_24_SUMMARY.md docs/iterations/iteration-24-summary.md && echo "✓ iteration-24-summary.md"
[ -f "ITERATION_25_SUMMARY.md" ] && mv ITERATION_25_SUMMARY.md docs/iterations/iteration-25-summary.md && echo "✓ iteration-25-summary.md"
[ -f "ITERATION_26_SUMMARY.md" ] && mv ITERATION_26_SUMMARY.md docs/iterations/iteration-26-summary.md && echo "✓ iteration-26-summary.md"
[ -f "THE_TRANSFORMATION.md" ] && mv THE_TRANSFORMATION.md docs/iterations/the-transformation.md && echo "✓ the-transformation.md"

# Move architecture docs
echo -e "\n${BLUE}Moving architecture documentation...${NC}"
[ -f "DATA_DRIVEN_ARCHITECTURE.md" ] && mv DATA_DRIVEN_ARCHITECTURE.md docs/architecture/data-driven-architecture.md && echo "✓ data-driven-architecture.md"
[ -f "DECLARATIVE_COMPONENTS.md" ] && mv DECLARATIVE_COMPONENTS.md docs/architecture/declarative-components.md && echo "✓ declarative-components.md"
[ -f "GENERIC_PAGE_SYSTEM.md" ] && mv GENERIC_PAGE_SYSTEM.md docs/architecture/generic-page-system.md && echo "✓ generic-page-system.md"

# Move package docs
echo -e "\n${BLUE}Moving package documentation...${NC}"
[ -f "PACKAGE_SYSTEM.md" ] && mv PACKAGE_SYSTEM.md docs/packages/package-system.md && echo "✓ package-system.md"
[ -f "PACKAGE_IMPORT_EXPORT.md" ] && mv PACKAGE_IMPORT_EXPORT.md docs/packages/import-export.md && echo "✓ import-export.md"
[ -f "PACKAGE_SCRIPTS_GUIDE.md" ] && mv PACKAGE_SCRIPTS_GUIDE.md docs/packages/scripts-guide.md && echo "✓ scripts-guide.md"
[ -f "MODULAR_PACKAGES_GUIDE.md" ] && mv MODULAR_PACKAGES_GUIDE.md docs/packages/modular-packages-guide.md && echo "✓ modular-packages-guide.md"
[ -f "MODULAR_SEED_DATA_GUIDE.md" ] && mv MODULAR_SEED_DATA_GUIDE.md docs/packages/modular-seed-data-guide.md && echo "✓ modular-seed-data-guide.md"
[ -f "IRC_CONVERSION_GUIDE.md" ] && mv IRC_CONVERSION_GUIDE.md docs/packages/irc-conversion-guide.md && echo "✓ irc-conversion-guide.md"

# Move Lua docs
echo -e "\n${BLUE}Moving Lua documentation...${NC}"
[ -f "LUA_INTEGRATION.md" ] && mv LUA_INTEGRATION.md docs/lua/integration.md && echo "✓ integration.md"
[ -f "LUA_SNIPPETS_GUIDE.md" ] && mv LUA_SNIPPETS_GUIDE.md docs/lua/snippets-guide.md && echo "✓ snippets-guide.md"

# Move development docs
echo -e "\n${BLUE}Moving development documentation...${NC}"
[ -f "TYPESCRIPT_REDUCTION_GUIDE.md" ] && mv TYPESCRIPT_REDUCTION_GUIDE.md docs/development/typescript-reduction-guide.md && echo "✓ typescript-reduction-guide.md"
[ -f "CRUFT_REMOVAL_REPORT.md" ] && mv CRUFT_REMOVAL_REPORT.md docs/development/cruft-removal-report.md && echo "✓ cruft-removal-report.md"
[ -f "IMPROVEMENTS.md" ] && mv IMPROVEMENTS.md docs/development/improvements.md && echo "✓ improvements.md"

# Move database docs
echo -e "\n${BLUE}Moving database documentation...${NC}"
[ -f "DATABASE.md" ] && mv DATABASE.md docs/database/overview.md && echo "✓ overview.md"

# Move security docs
echo -e "\n${BLUE}Moving security documentation...${NC}"
[ -f "SECURITY_GUIDE.md" ] && mv SECURITY_GUIDE.md docs/security/guide.md && echo "✓ guide.md"

# Move reference docs
echo -e "\n${BLUE}Moving reference documentation...${NC}"
[ -f "QUICK_REFERENCE.md" ] && mv QUICK_REFERENCE.md docs/reference/quick-reference.md && echo "✓ quick-reference.md"
[ -f "DOCUMENTATION_INDEX.md" ] && mv DOCUMENTATION_INDEX.md docs/reference/documentation-index.md && echo "✓ documentation-index.md"
[ -f "PLATFORM_GUIDE.md" ] && mv PLATFORM_GUIDE.md docs/reference/platform-guide.md && echo "✓ platform-guide.md"

echo -e "\n${GREEN}✅ Documentation relocation complete!${NC}"
echo -e "\n${BLUE}Files remaining in root (expected):${NC}"
ls -1 *.md 2>/dev/null || echo "No markdown files in root (this is expected)"

echo -e "\n${BLUE}Documentation structure:${NC}"
tree docs/ -L 2 2>/dev/null || find docs/ -type f -name "*.md" | sort

echo -e "\n${GREEN}📁 All documentation is now organized in the /docs directory${NC}"
