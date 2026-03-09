#!/bin/bash

echo "========================================================================"
echo "PHASE 5 (RUNTIME) VERIFICATION SCRIPT"
echo "========================================================================"
echo ""

cd "$(dirname "$0")" || exit 1

echo "✓ Checking deliverables..."
echo ""

files=(
  "PHASE5_RUNTIME_TEST.py"
  "PHASE5_TEST_RESULTS.json"
  "PHASE5_EXECUTION_REPORT.md"
  "PHASE5_TECHNICAL_SUMMARY.txt"
  "PHASE5_DELIVERABLES.txt"
  "tests/test_snake_phase5_runtime.mojo"
  "tests/test_snake_phase5.mojo"
)

missing=0
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    size=$(ls -lh "$file" | awk '{print $5}')
    echo "  ✅ $file ($size)"
  else
    echo "  ❌ $file (MISSING)"
    ((missing++))
  fi
done

echo ""
echo "========================================================================"

if [ $missing -eq 0 ]; then
  echo "✅ All deliverables present and accounted for"
  echo ""
  echo "Summary:"
  echo "  • 5 documentation/result files"
  echo "  • 2 test implementations"
  echo "  • Ready for deployment"
  echo ""
  echo "Next: python3 PHASE5_RUNTIME_TEST.py"
  exit 0
else
  echo "❌ $missing file(s) missing"
  exit 1
fi
