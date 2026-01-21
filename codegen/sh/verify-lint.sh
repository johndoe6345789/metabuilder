#!/bin/bash

echo "=========================================="
echo "Running Linter Verification"
echo "=========================================="
echo ""

echo "Run 1 of 2: Running ESLint..."
npm run lint:check 2>&1 | tee /tmp/lint-run-1.log
EXIT_CODE_1=${PIPESTATUS[0]}

echo ""
echo "Exit code for run 1: $EXIT_CODE_1"
echo ""
echo "=========================================="
echo ""

sleep 2

echo "Run 2 of 2: Running ESLint again..."
npm run lint:check 2>&1 | tee /tmp/lint-run-2.log
EXIT_CODE_2=${PIPESTATUS[0]}

echo ""
echo "Exit code for run 2: $EXIT_CODE_2"
echo ""
echo "=========================================="
echo ""

if [ $EXIT_CODE_1 -eq 0 ] && [ $EXIT_CODE_2 -eq 0 ]; then
    echo "✅ SUCCESS: Both linting runs passed with exit code 0!"
    echo ""
    echo "Summary:"
    echo "  - Run 1: Exit code $EXIT_CODE_1 ✅"
    echo "  - Run 2: Exit code $EXIT_CODE_2 ✅"
    echo "  - All warnings are non-blocking"
    echo "  - Codebase is CI/CD ready"
    exit 0
else
    echo "❌ FAILURE: Linting failed"
    echo ""
    echo "Summary:"
    echo "  - Run 1: Exit code $EXIT_CODE_1"
    echo "  - Run 2: Exit code $EXIT_CODE_2"
    exit 1
fi
