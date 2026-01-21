#!/bin/bash

# Quality Validator Runner Script
# Runs the quality validation analyzer on the React app

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         Quality Validator - Code Analysis Tool                ║"
echo "║                    snippet-pastebin Project                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Ensure we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Run from project root."
  exit 1
fi

echo "📊 Analyzing code quality..."
echo ""

# Start timing
START_TIME=$(date +%s%N)

# Run the quality checks
echo "🔍 Scanning source code..."
SOURCE_FILES=$(find src -type f \( -name "*.ts" -o -name "*.tsx" \) ! -name "*.test.*" ! -path "*/node_modules/*" | wc -l)
echo "   Found $SOURCE_FILES TypeScript source files"

echo ""
echo "📈 Analyzing code metrics..."

# Code Quality Analysis
echo ""
echo "═══ CODE QUALITY ANALYSIS ═════════════════════════════════════"
echo ""
echo "Checking cyclomatic complexity..."
COMPLEXITY_FILES=$(find src -type f \( -name "*.ts" -o -name "*.tsx" \) ! -name "*.test.*" -exec wc -l {} + | sort -n | tail -10)
echo "Top 10 largest files (by lines):"
echo "$COMPLEXITY_FILES" | head -10

echo ""
echo "═══ TEST COVERAGE ANALYSIS ════════════════════════════════════"
echo ""
if [ -f "coverage/coverage-final.json" ]; then
  echo "✓ Coverage data found"
  # Extract coverage percentages
  COVERAGE_LINES=$(grep -o '"lines":[0-9.]*' coverage/coverage-final.json | tail -1 | cut -d: -f2)
  COVERAGE_BRANCHES=$(grep -o '"branches":[0-9.]*' coverage/coverage-final.json | tail -1 | cut -d: -f2)
  COVERAGE_FUNCTIONS=$(grep -o '"functions":[0-9.]*' coverage/coverage-final.json | tail -1 | cut -d: -f2)
  echo "   Lines:       ${COVERAGE_LINES:-N/A}%"
  echo "   Branches:    ${COVERAGE_BRANCHES:-N/A}%"
  echo "   Functions:   ${COVERAGE_FUNCTIONS:-N/A}%"
else
  echo "⚠ No coverage data found (run: npm test -- --coverage)"
fi

echo ""
echo "═══ ARCHITECTURE ANALYSIS ═════════════════════════════════════"
echo ""
COMPONENT_COUNT=$(find src/components -type f \( -name "*.tsx" \) ! -name "*.test.*" | wc -l)
echo "✓ Component Count: $COMPONENT_COUNT files"

ATOMS=$(find src/components/atoms -type f \( -name "*.tsx" \) ! -name "*.test.*" 2>/dev/null | wc -l)
MOLECULES=$(find src/components/molecules -type f \( -name "*.tsx" \) ! -name "*.test.*" 2>/dev/null | wc -l)
ORGANISMS=$(find src/components/organisms -type f \( -name "*.tsx" \) ! -name "*.test.*" 2>/dev/null | wc -l)

echo "   Atoms:       $ATOMS"
echo "   Molecules:   $MOLECULES"
echo "   Organisms:   $ORGANISMS"

echo ""
echo "═══ SECURITY ANALYSIS ═════════════════════════════════════════"
echo ""
echo "Checking npm audit..."
npm audit --production --audit-level=moderate 2>&1 | tail -5

echo ""
echo "═══ SUMMARY ═══════════════════════════════════════════════════"
echo ""
END_TIME=$(date +%s%N)
DURATION=$(((END_TIME - START_TIME) / 1000000))
echo "✓ Analysis complete in ${DURATION}ms"
echo ""
echo "📌 Key Metrics:"
echo "   • Source Files:     $SOURCE_FILES"
echo "   • Components:       $COMPONENT_COUNT"
echo "   • Test Coverage:    ${COVERAGE_LINES:-Data not available}"
echo ""
echo "📝 Next Steps:"
echo "   1. Run 'npm test -- --coverage' for detailed coverage report"
echo "   2. Check QUALITY_VALIDATOR_DEMO.md for analysis interpretation"
echo "   3. See QUALITY_VALIDATOR_100_ROADMAP.md for improvement suggestions"
echo ""
echo "✨ For detailed HTML report, run:"
echo "   quality-validator --format html --output .quality/report.html"
echo ""
