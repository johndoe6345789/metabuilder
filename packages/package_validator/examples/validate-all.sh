#!/bin/bash
# Validate all packages in the packages directory

echo "🔍 Validating all packages..."
echo ""

PACKAGES_DIR="packages"
VALIDATOR_CLI="packages/package_validator/seed/scripts/cli.lua"

# Check if validator exists
if [ ! -f "$VALIDATOR_CLI" ]; then
  echo "❌ Error: Package validator not found at $VALIDATOR_CLI"
  exit 2
fi

# Get all package directories (exclude package_validator itself to avoid circular checks during initial validation)
PACKAGES=$(find "$PACKAGES_DIR" -maxdepth 1 -mindepth 1 -type d -exec basename {} \; | sort)

TOTAL=0
PASSED=0
FAILED=0
FAILED_PACKAGES=""

for PACKAGE in $PACKAGES; do
  TOTAL=$((TOTAL + 1))

  echo "──────────────────────────────────────"
  echo "📦 Package: $PACKAGE"
  echo ""

  if lua "$VALIDATOR_CLI" "$PACKAGE"; then
    PASSED=$((PASSED + 1))
    echo ""
  else
    FAILED=$((FAILED + 1))
    FAILED_PACKAGES="$FAILED_PACKAGES
  - $PACKAGE"
    echo ""
  fi
done

echo "=========================================="
echo ""
echo "📊 Validation Summary:"
echo "   Total packages:   $TOTAL"
echo "   ✅ Passed:        $PASSED"
echo "   ❌ Failed:        $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
  echo "🎉 All packages validated successfully!"
  exit 0
else
  echo "⚠️  Failed packages:$FAILED_PACKAGES"
  echo ""
  echo "Run with --verbose for detailed error information:"
  for PACKAGE in $FAILED_PACKAGES; do
    echo "  lua $VALIDATOR_CLI $(echo $PACKAGE | sed 's/^  - //') --verbose"
  done
  exit 1
fi
