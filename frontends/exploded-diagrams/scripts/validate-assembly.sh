#!/bin/bash
# Validate all parts in an assembly

ASSEMBLY_PATH=$1

if [ -z "$ASSEMBLY_PATH" ]; then
  echo "Usage: ./validate-assembly.sh <path-to-assembly>"
  echo "Example: ./validate-assembly.sh public/packages/automotive/ford/fiesta/gearbox"
  exit 1
fi

PARTS_PATH="$ASSEMBLY_PATH/parts"

if [ ! -d "$PARTS_PATH" ]; then
  echo "Error: Parts directory not found: $PARTS_PATH"
  exit 1
fi

echo "Validating parts in $ASSEMBLY_PATH"
echo "════════════════════════════════════════════════════════════"

TOTAL=0
PASSED=0
FAILED=0
WARNINGS=0
LOW_COMPLEXITY=0

for file in "$PARTS_PATH"/*.json; do
  if [ ! -f "$file" ]; then
    continue
  fi

  TOTAL=$((TOTAL + 1))
  BASENAME=$(basename "$file")
  printf "%-30s " "$BASENAME"

  # Validate structure and capture output
  VALIDATE_OUTPUT=$(npx tsx scripts/validate-geometry.ts "$file" 2>&1)
  VALIDATE_EXIT=$?

  # Check for errors (exit code 1 means errors)
  if [ $VALIDATE_EXIT -ne 0 ]; then
    # Check if it's just warnings or actual errors
    if echo "$VALIDATE_OUTPUT" | grep -q "FAILED"; then
      echo "✗ INVALID"
      FAILED=$((FAILED + 1))
      continue
    fi
  fi

  # Check for warnings (breeze block, no external features, etc)
  HAS_WARNINGS=0
  if echo "$VALIDATE_OUTPUT" | grep -q "⚠"; then
    HAS_WARNINGS=1
  fi

  # Check complexity
  SCORE=$(npx tsx scripts/complexity-score.ts "$file" 2>/dev/null | grep "TOTAL:" | awk '{print $2}')

  if [ -z "$SCORE" ]; then
    echo "✗ SCORE ERROR"
    FAILED=$((FAILED + 1))
    continue
  fi

  if [ "$SCORE" -lt 30 ]; then
    echo "⚠ LOW ($SCORE)"
    LOW_COMPLEXITY=$((LOW_COMPLEXITY + 1))
  elif [ "$HAS_WARNINGS" -eq 1 ]; then
    echo "⚠ WARN ($SCORE)"
    WARNINGS=$((WARNINGS + 1))
  elif [ "$SCORE" -lt 60 ]; then
    echo "→ OK ($SCORE)"
    PASSED=$((PASSED + 1))
  else
    echo "✓ GOOD ($SCORE)"
    PASSED=$((PASSED + 1))
  fi
done

echo "════════════════════════════════════════════════════════════"
echo "Total: $TOTAL | Passed: $PASSED | Warnings: $WARNINGS | Low: $LOW_COMPLEXITY | Failed: $FAILED"

if [ $FAILED -gt 0 ] || [ $LOW_COMPLEXITY -gt 0 ]; then
  exit 1
fi
