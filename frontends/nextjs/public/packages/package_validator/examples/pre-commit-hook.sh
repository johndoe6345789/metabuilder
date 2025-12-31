#!/bin/bash
# Pre-commit hook to validate package structure
# Place this in .git/hooks/pre-commit and make it executable

# Get the list of modified packages
MODIFIED_PACKAGES=$(git diff --cached --name-only | grep '^packages/' | cut -d'/' -f2 | sort -u)

if [ -z "$MODIFIED_PACKAGES" ]; then
  echo "No package files modified, skipping validation"
  exit 0
fi

echo "🔍 Validating modified packages..."
FAILED_PACKAGES=""
TOTAL_PACKAGES=0

for PACKAGE in $MODIFIED_PACKAGES; do
  TOTAL_PACKAGES=$((TOTAL_PACKAGES + 1))
  echo ""
  echo "Validating package: $PACKAGE"

  # Run the validator
  lua packages/package_validator/seed/scripts/cli.lua "$PACKAGE"

  if [ $? -ne 0 ]; then
    FAILED_PACKAGES="$FAILED_PACKAGES $PACKAGE"
  fi
done

echo ""
echo "========================================"

if [ -z "$FAILED_PACKAGES" ]; then
  echo "✅ All $TOTAL_PACKAGES package(s) passed validation!"
  exit 0
else
  echo "❌ Validation failed for package(s):$FAILED_PACKAGES"
  echo ""
  echo "Please fix the validation errors before committing."
  echo "You can run validation manually with:"
  for PACKAGE in $FAILED_PACKAGES; do
    echo "  lua packages/package_validator/seed/scripts/cli.lua $PACKAGE --verbose"
  done
  exit 1
fi
