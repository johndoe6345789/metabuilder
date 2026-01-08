#!/bin/bash
# Automated schema validation test suite
# Tests all schemas and examples for validity

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_DIR="$(dirname "$SCRIPT_DIR")"
VALIDATOR="$SCHEMA_DIR/schema_validator.sh"

# Counters
TOTAL=0
PASSED=0
FAILED=0
SKIPPED=0

echo "================================================="
echo "MetaBuilder Schema Validation Test Suite"
echo "================================================="
echo ""

# Check if validator exists
if [ ! -f "$VALIDATOR" ]; then
    echo -e "${RED}ERROR: Validator not found at $VALIDATOR${NC}"
    exit 1
fi

# Make validator executable
chmod +x "$VALIDATOR"

# Function to validate a file
validate_file() {
    local file="$1"
    local schema="$2"
    local name="$(basename "$file")"

    ((TOTAL++))

    printf "Testing %-50s ... " "$name"

    if "$VALIDATOR" "$file" &> /dev/null; then
        echo -e "${GREEN}PASS${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}FAIL${NC}"
        ((FAILED++))

        # Show error details
        echo -e "${YELLOW}Error details:${NC}"
        "$VALIDATOR" "$file" 2>&1 | sed 's/^/  /'
        echo ""
        return 1
    fi
}

# Function to test all files matching a pattern
test_schema_files() {
    local pattern="$1"
    local description="$2"

    echo ""
    echo "Testing $description..."
    echo "---------------------------------------------------"

    local files_found=false

    while IFS= read -r file; do
        if [ -f "$file" ]; then
            files_found=true
            validate_file "$file"
        fi
    done < <(find "$SCHEMA_DIR" -name "$pattern" -type f 2>/dev/null)

    if [ "$files_found" = false ]; then
        echo -e "${YELLOW}No files found matching $pattern${NC}"
        ((SKIPPED++))
    fi
}

# Test 1: Validate all schema definition files
test_schema_files "*_schema.json" "Schema Definition Files"

# Test 2: Validate example packages
echo ""
echo "Testing Example Packages..."
echo "---------------------------------------------------"

if [ -d "$SCHEMA_DIR/examples" ]; then
    # Minimal package
    if [ -d "$SCHEMA_DIR/examples/minimal-package" ]; then
        echo ""
        echo "Minimal Package:"
        for file in "$SCHEMA_DIR/examples/minimal-package"/**/*.json; do
            if [ -f "$file" ]; then
                validate_file "$file"
            fi
        done
    fi

    # Complete package
    if [ -d "$SCHEMA_DIR/examples/complete-package" ]; then
        echo ""
        echo "Complete Package:"
        for file in "$SCHEMA_DIR/examples/complete-package"/**/*.json; do
            if [ -f "$file" ]; then
                validate_file "$file"
            fi
        done
    fi
else
    echo -e "${YELLOW}Examples directory not found${NC}"
fi

# Test 3: Validate that schemas themselves are valid JSON
echo ""
echo "Testing JSON Validity..."
echo "---------------------------------------------------"

while IFS= read -r file; do
    ((TOTAL++))
    printf "Testing %-50s ... " "$(basename "$file")"

    if jq empty "$file" 2>/dev/null; then
        echo -e "${GREEN}PASS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}FAIL${NC}"
        ((FAILED++))
        jq empty "$file" 2>&1 | sed 's/^/  /'
    fi
done < <(find "$SCHEMA_DIR" -name "*.json" -type f ! -path "*/node_modules/*" 2>/dev/null)

# Test 4: Check for required fields in schemas
echo ""
echo "Testing Schema Metadata..."
echo "---------------------------------------------------"

check_schema_metadata() {
    local file="$1"
    local name="$(basename "$file")"

    ((TOTAL++))
    printf "Checking %-45s ... " "$name"

    local errors=()

    # Check for $schema field
    if ! jq -e '."$schema"' "$file" &>/dev/null; then
        errors+=("missing \$schema")
    fi

    # Check for $id field
    if ! jq -e '."$id"' "$file" &>/dev/null; then
        errors+=("missing \$id")
    fi

    # Check for title field
    if ! jq -e '.title' "$file" &>/dev/null; then
        errors+=("missing title")
    fi

    # Check for description field
    if ! jq -e '.description' "$file" &>/dev/null; then
        errors+=("missing description")
    fi

    if [ ${#errors[@]} -eq 0 ]; then
        echo -e "${GREEN}PASS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}FAIL${NC}"
        ((FAILED++))
        for error in "${errors[@]}"; do
            echo -e "  ${YELLOW}- $error${NC}"
        done
    fi
}

for schema in "$SCHEMA_DIR"/*_schema.json; do
    if [ -f "$schema" ]; then
        check_schema_metadata "$schema"
    fi
done

# Test 5: Cross-schema reference validation
echo ""
echo "Testing Cross-Schema References..."
echo "---------------------------------------------------"

# This is a placeholder for cross-schema validation
# In a real implementation, this would check:
# - API handlers exist in script schema
# - Type references are valid
# - Entity references are correct
echo -e "${YELLOW}Cross-schema validation: Manual review required${NC}"
((SKIPPED++))

# Summary
echo ""
echo "================================================="
echo "Test Summary"
echo "================================================="
echo -e "Total tests:  ${TOTAL}"
echo -e "Passed:       ${GREEN}${PASSED}${NC}"
echo -e "Failed:       ${RED}${FAILED}${NC}"
echo -e "Skipped:      ${YELLOW}${SKIPPED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
