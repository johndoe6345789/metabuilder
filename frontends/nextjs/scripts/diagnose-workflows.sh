#!/usr/bin/env bash
# Diagnose GitHub Actions workflow setup for local execution with act

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

echo "🔍 GitHub Actions Workflow Diagnostics"
echo "======================================="
echo

# Check if act is installed
echo "📦 Checking act installation..."
if ! command -v act &> /dev/null; then
    echo "⚠️  act is not installed (optional)"
    echo "   Install with: brew install act"
    ACT_AVAILABLE=false
else
    echo "✅ act version: $(act --version)"
    ACT_AVAILABLE=true
fi
echo

# Check Docker only if act is available
if [ "$ACT_AVAILABLE" = true ]; then
    echo "🐳 Checking Docker..."
    if ! command -v docker &> /dev/null; then
        echo "⚠️  Docker is not installed (optional for act)"
    elif ! docker info &> /dev/null; then
        echo "⚠️  Docker daemon is not running (optional for act)"
    else
        echo "✅ Docker is running"
    fi
    echo
fi

# List workflows
echo "📋 Available workflows in $PROJECT_ROOT/.github/workflows:"
if [ -d "$PROJECT_ROOT/.github/workflows" ]; then
    ls -1 "$PROJECT_ROOT/.github/workflows"/*.yml 2>/dev/null | while read -r workflow; do
        echo "   - $(basename "$workflow")"
    done
else
    echo "❌ No .github/workflows directory found"
    exit 1
fi
echo

# List jobs in main CI workflow
if [ "$ACT_AVAILABLE" = true ]; then
    echo "🏗️  Jobs in ci/ci.yml:"
    if [ -f "$PROJECT_ROOT/.github/workflows/ci/ci.yml" ]; then
        act -l -W "$PROJECT_ROOT/.github/workflows/ci/ci.yml" 2>/dev/null || echo "   (Failed to parse workflow)"
    else
        echo "❌ ci/ci.yml not found"
    fi
    echo
fi

# Check for .actrc or .secrets
echo "🔐 Checking for act configuration..."
if [ -f "$PROJECT_ROOT/.actrc" ]; then
    echo "✅ Found .actrc"
else
    echo "⚠️  No .actrc found (optional)"
fi

if [ -f "$PROJECT_ROOT/.secrets" ]; then
    echo "✅ Found .secrets"
else
    echo "⚠️  No .secrets found (optional)"
fi
echo

echo "✅ Diagnostics complete!"
echo

# Run workflow validation
echo "🔍 Running workflow validation..."
if [ -f "$SCRIPT_DIR/validate-workflows.py" ]; then
    python3 "$SCRIPT_DIR/validate-workflows.py"
else
    echo "⚠️  validate-workflows.py not found, skipping validation"
fi
echo

echo "💡 Tips:"
echo "   - Validate workflows: npm run act:validate"
echo "   - Simulate locally: npm run simulate:lint"
echo "   - Run specific job: npm run act:lint (requires act)"
echo "   - List all jobs: act -l (requires act)"
echo "   - Run with specific platform: act -P ubuntu-latest=catthehacker/ubuntu:act-latest"
