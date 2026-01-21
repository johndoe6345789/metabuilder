#!/bin/bash

echo "============================================"
echo "Linting Verification - First Run"
echo "============================================"
echo ""
echo "Running: npm run lint:check"
echo ""

npm run lint:check 2>&1

EXIT_CODE_1=$?

echo ""
echo "============================================"
echo "First Run Complete - Exit Code: $EXIT_CODE_1"
echo "============================================"
echo ""
echo "Waiting 2 seconds before second run..."
sleep 2
echo ""
echo "============================================"
echo "Linting Verification - Second Run"
echo "============================================"
echo ""
echo "Running: npm run lint:check"
echo ""

npm run lint:check 2>&1

EXIT_CODE_2=$?

echo ""
echo "============================================"
echo "Second Run Complete - Exit Code: $EXIT_CODE_2"
echo "============================================"
echo ""
echo "============================================"
echo "SUMMARY"
echo "============================================"
echo "First Run Exit Code:  $EXIT_CODE_1"
echo "Second Run Exit Code: $EXIT_CODE_2"
echo ""

if [ $EXIT_CODE_1 -eq 0 ] && [ $EXIT_CODE_2 -eq 0 ]; then
    echo "✅ SUCCESS: Both linting runs passed!"
    echo ""
    echo "All warnings are at acceptable levels."
    echo "No blocking errors detected."
    exit 0
else
    echo "❌ FAILURE: One or more linting runs failed"
    echo ""
    if [ $EXIT_CODE_1 -ne 0 ]; then
        echo "First run failed with exit code $EXIT_CODE_1"
    fi
    if [ $EXIT_CODE_2 -ne 0 ]; then
        echo "Second run failed with exit code $EXIT_CODE_2"
    fi
    exit 1
fi
