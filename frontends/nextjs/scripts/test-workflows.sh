#!/usr/bin/env bash
# Test GitHub Actions workflows locally using act

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

echo "🧪 Testing GitHub Actions Workflows Locally"
echo "==========================================="
echo

# Run diagnostics first
if [ -f "$SCRIPT_DIR/diagnose-workflows.sh" ]; then
    bash "$SCRIPT_DIR/diagnose-workflows.sh"
else
    echo "⚠️  diagnose-workflows.sh not found, skipping diagnostics"
fi

echo
echo "🏃 Running workflow tests..."
echo

# Test lint job
echo "1️⃣  Testing lint job..."
if act -W "$PROJECT_ROOT/.github/workflows/ci.yml" -j lint --dryrun; then
    echo "✅ Lint job syntax valid"
else
    echo "❌ Lint job has issues"
fi
echo

# Test typecheck job
echo "2️⃣  Testing typecheck job..."
if act -W "$PROJECT_ROOT/.github/workflows/ci.yml" -j typecheck --dryrun; then
    echo "✅ Typecheck job syntax valid"
else
    echo "❌ Typecheck job has issues"
fi
echo

# Test build job
echo "3️⃣  Testing build job..."
if act -W "$PROJECT_ROOT/.github/workflows/ci.yml" -j build --dryrun; then
    echo "✅ Build job syntax valid"
else
    echo "❌ Build job has issues"
fi
echo

echo "✅ Workflow test complete!"
echo
echo "💡 To actually run workflows (not just validate):"
echo "   npm run act:lint      # Run lint job"
echo "   npm run act:typecheck # Run typecheck job"
echo "   npm run act:build     # Run build job"
