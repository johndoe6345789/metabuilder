#!/bin/bash
# check-coverage.sh
# Checks json-summary coverage reports for all frontends.
# Gate: at least PASS_PCT% of frontends with coverage reports must meet THRESHOLD%.
#
# Usage: ./scripts/check-coverage.sh [--threshold <number>] [--pass-pct <number>]
#   --threshold  Per-frontend metric floor (default: 80)
#   --pass-pct   % of frontends that must pass (default: 80)
#
# Run from the repository root.

set -euo pipefail

THRESHOLD=80
PASS_PCT=80
FRONTENDS="nextjs codegen workflowui dbal exploded-diagrams pastebin postgres"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --threshold) THRESHOLD="$2"; shift 2 ;;
    --pass-pct)  PASS_PCT="$2";  shift 2 ;;
    *) echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

FAILED=0
PASSED=0
SKIPPED=0

check_frontend() {
  local frontend="$1"
  local summary="frontends/$frontend/coverage/coverage-summary.json"

  if [ ! -f "$summary" ]; then
    echo "  SKIP  $frontend — no coverage-summary.json"
    SKIPPED=$((SKIPPED + 1))
    return 0
  fi

  node - "$frontend" "$summary" "$THRESHOLD" <<'NODE_SCRIPT'
  const [,, frontend, summaryPath, thresholdStr] = process.argv;
  const threshold = parseFloat(thresholdStr);
  const fs = require('fs');
  let data;
  try { data = JSON.parse(fs.readFileSync(summaryPath, 'utf8')); }
  catch (err) {
    console.error(`  ERROR ${frontend}: cannot parse ${summaryPath}`);
    process.exit(2);
  }
  const total = data.total;
  if (!total) { console.error(`  ERROR ${frontend}: no "total" key`); process.exit(2); }
  const metrics = ['lines', 'functions', 'branches', 'statements'];
  const failed = [];
  metrics.forEach(metric => {
    const pct = total[metric]?.pct ?? null;
    if (pct === null) return;
    const ok = pct >= threshold ? 'PASS' : 'FAIL';
    console.log(`  ${ok}  ${frontend} ${metric}: ${pct}%`);
    if (pct < threshold) failed.push(`${metric} ${pct}%`);
  });
  if (failed.length) {
    console.error(`  FAIL  ${frontend}: ${failed.join(', ')} < ${threshold}%`);
    process.exit(1);
  }
  console.log(`  OK    ${frontend}: all metrics >= ${threshold}%`);
NODE_SCRIPT
}

echo "================================================"
echo "Coverage Gate (per-frontend: ${THRESHOLD}%, gate: ${PASS_PCT}% of frontends)"
echo "================================================"
echo ""

for frontend in $FRONTENDS; do
  result=0
  check_frontend "$frontend" || result=$?
  if [ -f "frontends/$frontend/coverage/coverage-summary.json" ]; then
    if [ "$result" -eq 0 ]; then
      PASSED=$((PASSED + 1))
    else
      FAILED=$((FAILED + 1))
    fi
  fi
done

TOTAL=$((PASSED + FAILED))
if [ "$TOTAL" -eq 0 ]; then
  echo "No coverage reports found — skipping gate."
  exit 0
fi

# Calculate pass percentage using awk (bash has no float arithmetic)
ACTUAL_PCT=$(awk "BEGIN { printf \"%.1f\", ($PASSED / $TOTAL) * 100 }")
GATE_MET=$(awk "BEGIN { print ($PASSED / $TOTAL * 100) >= $PASS_PCT ? \"yes\" : \"no\" }")

echo ""
echo "================================================"
echo "Results: $PASSED/$TOTAL frontends passed (${ACTUAL_PCT}%)"
echo "Gate requires: ${PASS_PCT}% of frontends >= ${THRESHOLD}% coverage"
echo "================================================"

if [ "$GATE_MET" = "yes" ]; then
  echo "COVERAGE GATE PASSED (${ACTUAL_PCT}% >= ${PASS_PCT}%)"
  exit 0
else
  echo "COVERAGE GATE FAILED (${ACTUAL_PCT}% < ${PASS_PCT}% required)"
  exit 1
fi
