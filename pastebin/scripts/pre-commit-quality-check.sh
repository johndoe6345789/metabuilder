#!/bin/bash

##
# Pre-commit Hook: Quality Check
# Runs quality validation before committing code
# Exit with --no-verify flag to skip checks
##

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
QUALITY_CONFIG=".quality/gates.json"
MIN_SCORE_THRESHOLD=85
SKIP_THRESHOLD=70

# Helper functions
print_header() {
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

# Check if quality config exists
if [ ! -f "$QUALITY_CONFIG" ]; then
  print_header "Quality Check Configuration"
  print_warning "Configuration file not found: $QUALITY_CONFIG"
  echo "Creating default configuration..."
  mkdir -p .quality
  cat > "$QUALITY_CONFIG" << 'EOF'
{
  "minOverallScore": 85,
  "minCodeQuality": 80,
  "minTestCoverage": 70,
  "minArchitecture": 80,
  "minSecurity": 85
}
EOF
  print_success "Configuration created at $QUALITY_CONFIG"
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
  print_header "Dependencies Check"
  print_warning "node_modules not found. Installing dependencies..."
  npm install
fi

# Run quality check
print_header "Pre-commit Quality Check"
echo "Running quality validation..."
echo ""

# Capture quality output
QUALITY_OUTPUT=$(node run-quality-check.mjs --format json --output .quality/pre-commit-report.json --no-color 2>&1 || true)
QUALITY_EXIT_CODE=$?

# Try to extract score from JSON report
if [ -f ".quality/pre-commit-report.json" ]; then
  OVERALL_SCORE=$(jq '.overall.score' .quality/pre-commit-report.json 2>/dev/null || echo "0")
  OVERALL_GRADE=$(jq -r '.overall.grade' .quality/pre-commit-report.json 2>/dev/null || echo "N/A")
  OVERALL_STATUS=$(jq -r '.overall.status' .quality/pre-commit-report.json 2>/dev/null || echo "unknown")

  # Extract component scores
  CODE_QUALITY=$(jq '.components.codeQuality.score' .quality/pre-commit-report.json 2>/dev/null || echo "N/A")
  TEST_COVERAGE=$(jq '.components.testCoverage.score' .quality/pre-commit-report.json 2>/dev/null || echo "N/A")
  ARCHITECTURE=$(jq '.components.architecture.score' .quality/pre-commit-report.json 2>/dev/null || echo "N/A")
  SECURITY=$(jq '.components.security.score' .quality/pre-commit-report.json 2>/dev/null || echo "N/A")
else
  OVERALL_SCORE=0
  OVERALL_GRADE="N/A"
  OVERALL_STATUS="unknown"
  CODE_QUALITY="N/A"
  TEST_COVERAGE="N/A"
  ARCHITECTURE="N/A"
  SECURITY="N/A"
fi

# Display results
echo ""
echo "Quality Check Results:"
echo "┌────────────────────────────────────────────┐"
printf "│ Overall Score: %-31s │\n" "$OVERALL_SCORE%"
printf "│ Grade: %-38s │\n" "$OVERALL_GRADE"
printf "│ Status: %-38s │\n" "$OVERALL_STATUS"
echo "├────────────────────────────────────────────┤"
printf "│ Code Quality:  %-31s │\n" "$CODE_QUALITY"
printf "│ Test Coverage: %-31s │\n" "$TEST_COVERAGE"
printf "│ Architecture:  %-31s │\n" "$ARCHITECTURE"
printf "│ Security:      %-31s │\n" "$SECURITY"
echo "└────────────────────────────────────────────┘"
echo ""

# Check quality gates
GATE_STATUS="pass"

# Check overall score
if (( $(echo "$OVERALL_SCORE < $MIN_SCORE_THRESHOLD" | bc -l) )); then
  print_error "Overall score ($OVERALL_SCORE%) is below minimum threshold ($MIN_SCORE_THRESHOLD%)"
  GATE_STATUS="fail"
else
  print_success "Overall score meets minimum threshold ($OVERALL_SCORE% >= $MIN_SCORE_THRESHOLD%)"
fi

# Check for critical security issues
CRITICAL_ISSUES=$(jq '.components.security.criticalCount // 0' .quality/pre-commit-report.json 2>/dev/null || echo "0")
if [ "$CRITICAL_ISSUES" -gt 0 ]; then
  print_error "Critical security issues found: $CRITICAL_ISSUES"
  GATE_STATUS="fail"
else
  print_success "No critical security issues found"
fi

# Determine final exit code
EXIT_CODE=0
if [ "$GATE_STATUS" = "fail" ]; then
  echo ""
  print_error "Pre-commit quality check FAILED"
  echo "To bypass this check, run: git commit --no-verify"
  echo "Note: The quality check will still be required before merging to main."
  echo ""
  EXIT_CODE=1
else
  echo ""
  print_success "Pre-commit quality check PASSED"
  echo ""
  EXIT_CODE=0
fi

# Show warnings even if pass
if [ "$OVERALL_SCORE" -lt "$MIN_SCORE_THRESHOLD" ] && [ "$OVERALL_SCORE" -ge "$SKIP_THRESHOLD" ]; then
  echo ""
  print_warning "Warning: Score is approaching minimum threshold"
  echo "Current: $OVERALL_SCORE%, Threshold: $MIN_SCORE_THRESHOLD%"
fi

exit $EXIT_CODE
