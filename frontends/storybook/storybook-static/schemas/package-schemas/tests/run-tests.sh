#!/bin/bash
# Test runner for schema validation test cases
# Runs tests defined in test-cases.json

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_DIR="$(dirname "$SCRIPT_DIR")"
TEST_CASES="$SCRIPT_DIR/test-cases.json"
TEMP_DIR="$SCRIPT_DIR/.temp"

# Counters
TOTAL=0
PASSED=0
FAILED=0

echo "================================================="
echo "MetaBuilder Schema Test Runner"
echo "================================================="
echo ""

# Check dependencies
if ! command -v jq &> /dev/null; then
    echo -e "${RED}ERROR: jq is required but not installed${NC}"
    exit 1
fi

if ! command -v jsonschema-cli &> /dev/null && ! command -v ajv &> /dev/null; then
    echo -e "${YELLOW}WARNING: No JSON schema validator found${NC}"
    echo "Install one of:"
    echo "  - jsonschema-cli: cargo install jsonschema-cli"
    echo "  - ajv-cli: npm install -g ajv-cli"
    echo ""
fi

# Create temp directory
mkdir -p "$TEMP_DIR"

# Cleanup on exit
cleanup() {
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# Get test suites count
SUITE_COUNT=$(jq '.testSuites | length' "$TEST_CASES")

echo "Running $SUITE_COUNT test suites..."
echo ""

# Function to validate JSON against schema
validate_json() {
    local data_file="$1"
    local schema_file="$2"

    # Try jsonschema-cli first
    if command -v jsonschema-cli &> /dev/null; then
        jsonschema-cli "$schema_file" "$data_file" &> /dev/null
        return $?
    fi

    # Fall back to ajv
    if command -v ajv &> /dev/null; then
        ajv validate -s "$schema_file" -d "$data_file" &> /dev/null
        return $?
    fi

    # No validator available
    echo "No validator available" >&2
    return 2
}

# Run all test suites
for ((suite_idx=0; suite_idx<SUITE_COUNT; suite_idx++)); do
    SUITE_NAME=$(jq -r ".testSuites[$suite_idx].name" "$TEST_CASES")
    SCHEMA_FILE="$SCHEMA_DIR/$(jq -r ".testSuites[$suite_idx].schema" "$TEST_CASES")"
    TEST_COUNT=$(jq ".testSuites[$suite_idx].tests | length" "$TEST_CASES")

    echo -e "${BLUE}$SUITE_NAME${NC}"
    echo "Schema: $(basename "$SCHEMA_FILE")"
    echo "Tests: $TEST_COUNT"
    echo "---------------------------------------------------"

    # Run each test in the suite
    for ((test_idx=0; test_idx<TEST_COUNT; test_idx++)); do
        TEST_NAME=$(jq -r ".testSuites[$suite_idx].tests[$test_idx].name" "$TEST_CASES")
        SHOULD_BE_VALID=$(jq -r ".testSuites[$suite_idx].tests[$test_idx].valid" "$TEST_CASES")
        TEST_DATA=$(jq ".testSuites[$suite_idx].tests[$test_idx].data" "$TEST_CASES")

        ((TOTAL++))

        # Write test data to temp file
        TEST_FILE="$TEMP_DIR/test_${suite_idx}_${test_idx}.json"
        echo "$TEST_DATA" > "$TEST_FILE"

        # Run validation
        printf "  %-50s ... " "$TEST_NAME"

        if validate_json "$TEST_FILE" "$SCHEMA_FILE"; then
            # Validation passed
            if [ "$SHOULD_BE_VALID" = "true" ]; then
                echo -e "${GREEN}PASS${NC}"
                ((PASSED++))
            else
                echo -e "${RED}FAIL${NC} (expected validation to fail)"
                ((FAILED++))
            fi
        else
            # Validation failed
            if [ "$SHOULD_BE_VALID" = "false" ]; then
                echo -e "${GREEN}PASS${NC} (correctly rejected)"
                ((PASSED++))
            else
                echo -e "${RED}FAIL${NC} (unexpected validation error)"
                ((FAILED++))

                # Show error details in verbose mode
                if [ "$VERBOSE" = "1" ]; then
                    echo "  Data: $TEST_DATA"
                fi
            fi
        fi
    done

    echo ""
done

# Summary
echo "================================================="
echo "Test Summary"
echo "================================================="
echo -e "Total tests:  $TOTAL"
echo -e "Passed:       ${GREEN}$PASSED${NC}"
echo -e "Failed:       ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    PASS_RATE=$((PASSED * 100 / TOTAL))
    echo -e "${RED}✗ $FAILED tests failed${NC} (${PASS_RATE}% pass rate)"
    exit 1
fi
