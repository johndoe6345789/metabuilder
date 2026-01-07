#!/bin/bash
# Package Schema Validator
# Validates that all JSON files in packages match their corresponding schemas

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SCHEMA_DIR="$REPO_ROOT/schemas/package-schemas"
PACKAGES_DIR="$REPO_ROOT/packages"

# Counters
TOTAL=0
PASSED=0
FAILED=0
SKIPPED=0

# Array to track failed files
declare -a FAILED_FILES=()

echo "================================================="
echo "Package Schema Validation"
echo "================================================="
echo ""

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo -e "${RED}ERROR: npx not found. Please install Node.js${NC}"
    exit 1
fi

# Function to validate using ajv-cli via npx
validate_with_ajv() {
    local schema="$1"
    local data="$2"
    npx -y -q ajv-cli@5.0.0 validate -s "$schema" -d "$data" --strict=false 2>&1
}

# Function to validate a file
validate_file() {
    local file="$1"
    local schema_file="$2"
    local display_name="$3"

    ((TOTAL++))

    printf "%-70s ... " "$display_name"

    if [ ! -f "$schema_file" ]; then
        echo -e "${YELLOW}SKIP${NC} (schema not found)"
        ((SKIPPED++))
        return 0
    fi

    if validate_with_ajv "$schema_file" "$file" | grep -q "valid"; then
        echo -e "${GREEN}PASS${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}FAIL${NC}"
        ((FAILED++))
        FAILED_FILES+=("$display_name")
        
        # Show error details if verbose
        if [ "${VERBOSE:-0}" = "1" ]; then
            echo -e "${YELLOW}Error details:${NC}"
            validate_with_ajv "$schema_file" "$file" 2>&1 | sed 's/^/  /' | head -20
            echo ""
        fi
        return 1
    fi
}

# Main validation
echo -e "${BLUE}Validating functions.json files...${NC}"
echo "---------------------------------------------------"

# Validate all functions.json files
for functions_file in "$PACKAGES_DIR"/*/scripts/functions.json; do
    if [ -f "$functions_file" ]; then
        pkg_name=$(basename "$(dirname "$(dirname "$functions_file")")")
        validate_file "$functions_file" "$SCHEMA_DIR/functions_schema.json" "${pkg_name}/scripts/functions.json"
    fi
done

echo ""
echo -e "${BLUE}Validating package.json files...${NC}"
echo "---------------------------------------------------"

# Validate all package.json files
for pkg_file in "$PACKAGES_DIR"/*/package.json; do
    if [ -f "$pkg_file" ]; then
        pkg_name=$(basename "$(dirname "$pkg_file")")
        validate_file "$pkg_file" "$SCHEMA_DIR/metadata_schema.json" "${pkg_name}/package.json"
    fi
done

echo ""
echo -e "${BLUE}Validating other schema files...${NC}"
echo "---------------------------------------------------"

# Validate components/ui.json
for comp_file in "$PACKAGES_DIR"/*/components/ui.json; do
    if [ -f "$comp_file" ]; then
        pkg_name=$(basename "$(dirname "$(dirname "$comp_file")")")
        validate_file "$comp_file" "$SCHEMA_DIR/components_schema.json" "${pkg_name}/components/ui.json"
    fi
done

# Validate permissions/roles.json
for perm_file in "$PACKAGES_DIR"/*/permissions/roles.json; do
    if [ -f "$perm_file" ]; then
        pkg_name=$(basename "$(dirname "$(dirname "$perm_file")")")
        validate_file "$perm_file" "$SCHEMA_DIR/permissions_schema.json" "${pkg_name}/permissions/roles.json"
    fi
done

# Summary
echo ""
echo "================================================="
echo "Validation Summary"
echo "================================================="
echo -e "Total files:  ${TOTAL}"
echo -e "Passed:       ${GREEN}${PASSED}${NC}"
echo -e "Failed:       ${RED}${FAILED}${NC}"
echo -e "Skipped:      ${YELLOW}${SKIPPED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All validated files pass schema checks!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some files failed validation:${NC}"
    for failed_file in "${FAILED_FILES[@]}"; do
        echo -e "  - ${RED}${failed_file}${NC}"
    done
    echo ""
    echo -e "${YELLOW}Tip: Run with VERBOSE=1 for detailed error messages${NC}"
    echo -e "${YELLOW}Example: VERBOSE=1 $0${NC}"
    exit 1
fi
