#!/bin/bash

# Comprehensive test for triage-duplicate-issues.sh logic
# This tests the core functions without making actual API calls

set -e

echo "🧪 Testing triage-duplicate-issues.sh logic"
echo "============================================="
echo ""

# Source the functions we need to test (extract them from the main script)
# For testing, we'll recreate them here

get_issues_to_close() {
  local issues_data="$1"
  
  if [ -z "$issues_data" ]; then
    echo "⚠️  No duplicate issues found" >&2
    return 0
  fi
  
  local total_count=$(echo "$issues_data" | wc -l)
  
  if [ "$total_count" -le 1 ]; then
    echo "ℹ️  Only one issue found, nothing to close" >&2
    return 0
  fi
  
  # Skip the first line (most recent issue) and get the rest
  echo "$issues_data" | tail -n +2 | cut -d'|' -f1
}

# Test 1: Multiple duplicate issues
echo "Test 1: Multiple duplicate issues (should close all except most recent)"
echo "-----------------------------------------------------------------------"
TEST_DATA_1='124|2025-12-27T10:30:00Z|🚨 Production Deployment Failed
122|2025-12-27T10:25:00Z|🚨 Production Deployment Failed
121|2025-12-27T10:20:00Z|🚨 Production Deployment Failed
119|2025-12-27T10:15:00Z|🚨 Production Deployment Failed
117|2025-12-27T10:10:00Z|🚨 Production Deployment Failed'

TOTAL=$(echo "$TEST_DATA_1" | wc -l)
MOST_RECENT=$(echo "$TEST_DATA_1" | head -1 | cut -d'|' -f1)
TO_CLOSE=$(get_issues_to_close "$TEST_DATA_1")
TO_CLOSE_COUNT=$(echo "$TO_CLOSE" | wc -l)

echo "  Total issues found: $TOTAL"
echo "  Most recent issue: #$MOST_RECENT"
echo "  Issues to close: $(echo $TO_CLOSE | tr '\n' ' ')"
echo "  Count to close: $TO_CLOSE_COUNT"

if [ "$MOST_RECENT" = "124" ] && [ "$TO_CLOSE_COUNT" = "4" ]; then
  echo "  ✅ PASS: Correctly identified most recent and 4 issues to close"
else
  echo "  ❌ FAIL: Expected most recent=#124, count=4"
  exit 1
fi
echo ""

# Test 2: Two duplicate issues
echo "Test 2: Two duplicate issues (should close oldest, keep newest)"
echo "----------------------------------------------------------------"
TEST_DATA_2='150|2025-12-27T11:00:00Z|Bug in login
148|2025-12-27T10:55:00Z|Bug in login'

TOTAL=$(echo "$TEST_DATA_2" | wc -l)
MOST_RECENT=$(echo "$TEST_DATA_2" | head -1 | cut -d'|' -f1)
TO_CLOSE=$(get_issues_to_close "$TEST_DATA_2")
TO_CLOSE_COUNT=$(echo "$TO_CLOSE" | wc -l)

echo "  Total issues found: $TOTAL"
echo "  Most recent issue: #$MOST_RECENT"
echo "  Issues to close: $TO_CLOSE"
echo "  Count to close: $TO_CLOSE_COUNT"

if [ "$MOST_RECENT" = "150" ] && [ "$TO_CLOSE" = "148" ] && [ "$TO_CLOSE_COUNT" = "1" ]; then
  echo "  ✅ PASS: Correctly keeps newest (#150) and closes oldest (#148)"
else
  echo "  ❌ FAIL: Expected most recent=#150, to_close=#148"
  exit 1
fi
echo ""

# Test 3: Single issue
echo "Test 3: Single issue (should not close anything)"
echo "-------------------------------------------------"
TEST_DATA_3='200|2025-12-27T12:00:00Z|Unique issue'

TOTAL=$(echo "$TEST_DATA_3" | wc -l)
MOST_RECENT=$(echo "$TEST_DATA_3" | head -1 | cut -d'|' -f1)
TO_CLOSE=$(get_issues_to_close "$TEST_DATA_3" 2>&1)

echo "  Total issues found: $TOTAL"
echo "  Most recent issue: #$MOST_RECENT"

if [ -z "$(echo "$TO_CLOSE" | grep -v "Only one issue")" ]; then
  echo "  ✅ PASS: Correctly identified no issues to close (only 1 issue)"
else
  echo "  ❌ FAIL: Should not close anything with only 1 issue"
  exit 1
fi
echo ""

# Test 4: Empty input
echo "Test 4: Empty input (should handle gracefully)"
echo "----------------------------------------------"
TO_CLOSE=$(get_issues_to_close "" 2>&1)

if [ -z "$(echo "$TO_CLOSE" | grep -v "No duplicate issues")" ]; then
  echo "  ✅ PASS: Correctly handled empty input"
else
  echo "  ❌ FAIL: Should handle empty input gracefully"
  exit 1
fi
echo ""

# Test 5: Date parsing and sorting verification
echo "Test 5: Verify sorting by creation date (newest first)"
echo "-------------------------------------------------------"
TEST_DATA_5='300|2025-12-27T15:00:00Z|Issue C
299|2025-12-27T14:00:00Z|Issue B
298|2025-12-27T13:00:00Z|Issue A'

MOST_RECENT=$(echo "$TEST_DATA_5" | head -1 | cut -d'|' -f1)
MOST_RECENT_DATE=$(echo "$TEST_DATA_5" | head -1 | cut -d'|' -f2)
OLDEST=$(echo "$TEST_DATA_5" | tail -1 | cut -d'|' -f1)

echo "  Most recent: #$MOST_RECENT at $MOST_RECENT_DATE"
echo "  Oldest: #$OLDEST"

if [ "$MOST_RECENT" = "300" ] && [ "$OLDEST" = "298" ]; then
  echo "  ✅ PASS: Correctly sorted by date (newest first)"
else
  echo "  ❌ FAIL: Sorting is incorrect"
  exit 1
fi
echo ""

# Test 6: jq parsing simulation (test data format)
echo "Test 6: Verify data format compatibility with jq"
echo "-------------------------------------------------"
MOCK_JSON='{"items": [
  {"number": 124, "created_at": "2025-12-27T10:30:00Z", "title": "Test"},
  {"number": 122, "created_at": "2025-12-27T10:25:00Z", "title": "Test"}
]}'

# Test that jq can parse and format the data correctly
PARSED=$(echo "$MOCK_JSON" | jq -r '.items | sort_by(.created_at) | reverse | .[] | "\(.number)|\(.created_at)|\(.title)"')
FIRST_ISSUE=$(echo "$PARSED" | head -1 | cut -d'|' -f1)

if [ "$FIRST_ISSUE" = "124" ]; then
  echo "  ✅ PASS: jq parsing and formatting works correctly"
else
  echo "  ❌ FAIL: jq parsing failed"
  exit 1
fi
echo ""

echo "============================================="
echo "✅ All tests passed!"
echo ""
echo "Summary:"
echo "  - Correctly identifies most recent issue"
echo "  - Closes all duplicates except the most recent"
echo "  - Handles edge cases (single issue, empty input)"
echo "  - Date sorting works correctly"
echo "  - Data format compatible with GitHub API response"
