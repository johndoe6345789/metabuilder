#!/bin/bash

# DBAL C++ Linting and Formatting Script
# Uses industry-standard tools: clang-tidy, clang-format, cppcheck

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "DBAL C++ Code Quality Check"
echo "========================================="
echo ""

# Check if tools are installed
MISSING_TOOLS=()

if ! command -v clang-tidy &> /dev/null; then
    MISSING_TOOLS+=("clang-tidy")
fi

if ! command -v clang-format &> /dev/null; then
    MISSING_TOOLS+=("clang-format")
fi

if ! command -v cppcheck &> /dev/null; then
    MISSING_TOOLS+=("cppcheck")
fi

if [ ${#MISSING_TOOLS[@]} -ne 0 ]; then
    echo -e "${YELLOW}Warning: Missing tools: ${MISSING_TOOLS[*]}${NC}"
    echo "Install with:"
    echo "  Ubuntu/Debian: sudo apt-get install clang-tidy clang-format cppcheck"
    echo "  macOS: brew install llvm cppcheck"
    echo ""
fi

# Change to cpp directory
cd "$(dirname "$0")"

# Function to print section header
print_section() {
    echo ""
    echo "========================================="
    echo "$1"
    echo "========================================="
}

# 1. clang-format (code formatting)
if command -v clang-format &> /dev/null; then
    print_section "1. Running clang-format (code formatting)"
    
    # Check if --fix flag is provided
    if [ "$1" == "--fix" ]; then
        echo "Applying formatting fixes..."
        find src include -name "*.cpp" -o -name "*.hpp" -o -name "*.h" | \
            xargs clang-format -i --style=file
        echo -e "${GREEN}✓ Formatting applied${NC}"
    else
        echo "Checking formatting (use --fix to apply)..."
        FORMAT_ISSUES=$(find src include -name "*.cpp" -o -name "*.hpp" -o -name "*.h" | \
            xargs clang-format --dry-run --Werror --style=file 2>&1 || true)
        
        if [ -n "$FORMAT_ISSUES" ]; then
            echo -e "${YELLOW}⚠ Formatting issues found:${NC}"
            echo "$FORMAT_ISSUES"
        else
            echo -e "${GREEN}✓ All files properly formatted${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠ clang-format not found, skipping${NC}"
fi

# 2. clang-tidy (static analysis)
if command -v clang-tidy &> /dev/null; then
    print_section "2. Running clang-tidy (static analysis)"
    
    # Build compile_commands.json if it doesn't exist
    if [ ! -f build/compile_commands.json ]; then
        echo "Generating compile_commands.json..."
        mkdir -p build
        cd build
        cmake -DCMAKE_EXPORT_COMPILE_COMMANDS=ON ..
        cd ..
    fi
    
    echo "Analyzing source files..."
    TIDY_ISSUES=0
    
    # Run clang-tidy on all source files
    find src -name "*.cpp" | while read -r file; do
        echo "Checking $file..."
        if ! clang-tidy "$file" -p build/ --quiet 2>&1; then
            TIDY_ISSUES=$((TIDY_ISSUES + 1))
        fi
    done
    
    if [ $TIDY_ISSUES -eq 0 ]; then
        echo -e "${GREEN}✓ No issues found${NC}"
    else
        echo -e "${YELLOW}⚠ Found $TIDY_ISSUES files with issues${NC}"
    fi
else
    echo -e "${YELLOW}⚠ clang-tidy not found, skipping${NC}"
fi

# 3. cppcheck (additional static analysis)
if command -v cppcheck &> /dev/null; then
    print_section "3. Running cppcheck (additional analysis)"
    
    cppcheck --enable=all \
             --suppress=missingIncludeSystem \
             --suppress=unusedFunction \
             --quiet \
             --std=c++17 \
             -I include \
             src/ 2>&1 | tee cppcheck-report.txt
    
    if [ -s cppcheck-report.txt ]; then
        echo -e "${YELLOW}⚠ Issues found (see cppcheck-report.txt)${NC}"
    else
        echo -e "${GREEN}✓ No issues found${NC}"
        rm -f cppcheck-report.txt
    fi
else
    echo -e "${YELLOW}⚠ cppcheck not found, skipping${NC}"
fi

# 4. Check for common issues
print_section "4. Checking for common issues"

echo "Checking for TODO/FIXME comments..."
TODO_COUNT=$(grep -r "TODO\|FIXME" src/ include/ || true | wc -l)
if [ "$TODO_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠ Found $TODO_COUNT TODO/FIXME comments${NC}"
    grep -rn "TODO\|FIXME" src/ include/ || true
else
    echo -e "${GREEN}✓ No TODO/FIXME comments${NC}"
fi

echo ""
echo "Checking for long functions (>100 lines)..."
LONG_FUNCTIONS=$(awk '/^[[:space:]]*[a-zA-Z_].*\(.*\).*\{/{count=0; name=$0}
                     {count++}
                     /^[[:space:]]*\}/{if(count>100) print FILENAME":"NR" "name" ("count" lines)"}' \
                     $(find src -name "*.cpp") || true)
if [ -n "$LONG_FUNCTIONS" ]; then
    echo -e "${YELLOW}⚠ Long functions found:${NC}"
    echo "$LONG_FUNCTIONS"
else
    echo -e "${GREEN}✓ No overly long functions${NC}"
fi

# Summary
print_section "Summary"
echo "Linting complete!"
echo ""
echo "To fix formatting issues, run: ./lint.sh --fix"
echo "For detailed analysis, check the generated reports."
echo ""
