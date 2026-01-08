#!/bin/bash
# Validate TLA+ Specifications
# This script checks the syntax of all TLA+ specifications in the spec directory

set -e

SPEC_DIR="$(dirname "$0")"
TLA_TOOLS="${TLA_TOOLS:-/tmp/tla2tools.jar}"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "TLA+ Specification Validator"
echo "============================="
echo ""

# Check if TLA+ tools are available
if [ ! -f "$TLA_TOOLS" ]; then
    echo -e "${YELLOW}TLA+ tools not found at $TLA_TOOLS${NC}"
    echo "Downloading TLA+ tools..."
    wget -q -O "$TLA_TOOLS" https://github.com/tlaplus/tlaplus/releases/download/v1.8.0/tla2tools.jar
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Downloaded TLA+ tools${NC}"
    else
        echo -e "${RED}✗ Failed to download TLA+ tools${NC}"
        exit 1
    fi
fi

# Check Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}✗ Java not found. Please install Java 11 or later.${NC}"
    exit 1
fi

echo "Using TLA+ tools: $TLA_TOOLS"
echo ""

# List of specifications to validate
SPECS=(
    "metabuilder.tla"
    "workflow_system.tla"
    "collaboration.tla"
    "integrations.tla"
    "package_system.tla"
)

FAILED=0
PASSED=0

# Validate each specification
for spec in "${SPECS[@]}"; do
    spec_path="$SPEC_DIR/$spec"
    
    if [ ! -f "$spec_path" ]; then
        echo -e "${YELLOW}⚠ Skipping $spec (file not found)${NC}"
        continue
    fi
    
    echo "Validating $spec..."
    
    # Run SANY (syntax and semantic analyzer)
    output=$(java -cp "$TLA_TOOLS" tla2sany.SANY "$spec_path" 2>&1)
    
    # Check for errors
    if echo "$output" | grep -q "Semantic errors:" || echo "$output" | grep -q "Parsing or semantic analysis failed."; then
        echo -e "${RED}✗ $spec: FAILED${NC}"
        echo "$output" | grep -A 10 "Semantic errors:"
        FAILED=$((FAILED + 1))
    else
        echo -e "${GREEN}✓ $spec: PASSED${NC}"
        PASSED=$((PASSED + 1))
    fi
    
    echo ""
done

# Summary
echo "============================="
echo "Validation Summary"
echo "============================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All specifications are valid!${NC}"
    exit 0
else
    echo -e "${RED}Some specifications have errors. Please review the output above.${NC}"
    exit 1
fi
