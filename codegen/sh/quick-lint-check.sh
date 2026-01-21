#!/bin/bash

# Quick Lint Status Checker
# Shows current linting health at a glance

echo "🔍 Quick Lint Status Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run lint check
npm run lint:check > /tmp/quick-lint.log 2>&1
EXIT_CODE=$?

# Extract metrics
TOTAL_WARNINGS=$(grep -c "warning" /tmp/quick-lint.log || echo "0")
TOTAL_ERRORS=$(grep -c "error" /tmp/quick-lint.log || echo "0")
FILES_WITH_ISSUES=$(grep -oP "/.+?\.tsx?" /tmp/quick-lint.log | sort -u | wc -l)

# Display results
echo "Exit Code:      $([ $EXIT_CODE -eq 0 ] && echo "✅ 0 (PASSING)" || echo "❌ $EXIT_CODE (FAILING)")"
echo "Errors:         $([ $TOTAL_ERRORS -eq 0 ] && echo "✅ $TOTAL_ERRORS" || echo "❌ $TOTAL_ERRORS")"
echo "Warnings:       ⚠️  $TOTAL_WARNINGS"
echo "Files Affected: 📄 $FILES_WITH_ISSUES"
echo ""

# Top 5 warning types
echo "Top Warning Types:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
grep -oP '@typescript-eslint/[a-z-]+|react-hooks/[a-z-]+|react-refresh/[a-z-]+|no-[a-z-]+' /tmp/quick-lint.log 2>/dev/null | \
    sort | uniq -c | sort -rn | head -5 | \
    awk '{printf "  %3d  %s\n", $1, $2}'
echo ""

# TypeScript check
echo "TypeScript Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npx tsc --noEmit > /tmp/quick-tsc.log 2>&1
TSC_EXIT_CODE=$?
echo "Compilation:    $([ $TSC_EXIT_CODE -eq 0 ] && echo "✅ PASSING" || echo "❌ FAILING")"
echo ""

# Overall verdict
echo "Overall Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $EXIT_CODE -eq 0 ] && [ $TSC_EXIT_CODE -eq 0 ]; then
    echo "✅ HEALTHY - Ready for CI/CD"
    echo ""
    echo "The $TOTAL_WARNINGS warnings are expected for"
    echo "this JSON-driven architecture and are non-blocking."
elif [ $EXIT_CODE -eq 0 ] && [ $TSC_EXIT_CODE -ne 0 ]; then
    echo "⚠️  NEEDS ATTENTION - TypeScript errors"
    echo "See: /tmp/quick-tsc.log"
elif [ $EXIT_CODE -ne 0 ]; then
    echo "❌ ISSUES FOUND - ESLint blocking errors"
    echo "See: /tmp/quick-lint.log"
fi
echo ""

# Show commands
echo "Available Commands:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  npm run lint:check     - Check linting"
echo "  npm run lint           - Auto-fix issues"
echo "  npx tsc --noEmit       - Type check"
echo "  ./procedural-lint-fix.sh - Full analysis"
echo ""
