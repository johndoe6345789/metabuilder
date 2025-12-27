#!/bin/bash

# Comprehensive test for triage-duplicate-issues.sh logic
# This tests the core functions without making actual API calls

set -e

echo "🧪 Testing triage-duplicate-issues.sh logic"
echo "============================================="
echo ""

# Source the functions we need to test (extract them from the main script)
# For testing, we'll recreate them here

get_issues_by_title() {
  local issues_data="$1"
  local title="$2"
  
  # Filter issues matching the exact title and sort by date (newest first)
  echo "$issues_data" | grep -F "|$title" | sort -t'|' -k2 -r
}

find_duplicate_titles() {
  local issues_data="$1"
  local search_filter="$2"
  
  if [ -z "$issues_data" ]; then
    return 0
  fi
  
  # Extract unique titles and count occurrences
  local title_counts
  if [ -n "$search_filter" ]; then
    # Filter by specific title if provided
    title_counts=$(echo "$issues_data" | cut -d'|' -f3- | grep -F "$search_filter" | sort | uniq -c | awk '$1 > 1 {$1=""; print substr($0,2)}')
  else
    # Find all duplicate titles
    title_counts=$(echo "$issues_data" | cut -d'|' -f3- | sort | uniq -c | awk '$1 > 1 {$1=""; print substr($0,2)}')
  fi
  
  echo "$title_counts"
}

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

# Test 1: Finding duplicate titles across multiple groups
echo "Test 1: Finding duplicate titles from mixed issues"
echo "---------------------------------------------------"
TEST_DATA='199|2025-12-27T18:12:06Z|⚠️ Pre-Deployment Validation Failed
195|2025-12-27T18:09:38Z|⚠️ Pre-Deployment Validation Failed
194|2025-12-27T18:01:57Z|⚠️ Pre-Deployment Validation Failed
100|2025-12-27T10:00:00Z|🚨 Production Deployment Failed
99|2025-12-27T09:00:00Z|🚨 Production Deployment Failed
50|2025-12-26T12:00:00Z|Unique issue without duplicates'

DUPLICATES=$(find_duplicate_titles "$TEST_DATA" "")
DUP_COUNT=$(echo "$DUPLICATES" | wc -l)

echo "  Found duplicate title groups: $DUP_COUNT"
echo "  Titles with duplicates:"
while IFS= read -r dup_title; do
  echo "    - \"$dup_title\""
done <<< "$DUPLICATES"

if [ "$DUP_COUNT" = "2" ]; then
  echo "  ✅ PASS: Correctly found 2 groups of duplicates"
else
  echo "  ❌ FAIL: Expected 2 duplicate groups, got $DUP_COUNT"
  exit 1
fi
echo ""

# Test 2: Filtering for specific title
echo "Test 2: Filtering for specific duplicate title"
echo "----------------------------------------------"
FILTERED=$(find_duplicate_titles "$TEST_DATA" "Pre-Deployment")
FILTERED_COUNT=$(echo "$FILTERED" | wc -l)

echo "  Filtered to titles containing 'Pre-Deployment': $FILTERED_COUNT group(s)"
if [ "$FILTERED_COUNT" = "1" ]; then
  echo "  ✅ PASS: Correctly filtered to 1 specific title"
else
  echo "  ❌ FAIL: Expected 1 filtered title, got $FILTERED_COUNT"
  exit 1
fi
echo ""

# Test 3: Getting issues by specific title
echo "Test 3: Getting issues by specific title"
echo "----------------------------------------"
TITLE="⚠️ Pre-Deployment Validation Failed"
TITLE_ISSUES=$(get_issues_by_title "$TEST_DATA" "$TITLE")
TITLE_COUNT=$(echo "$TITLE_ISSUES" | wc -l)
MOST_RECENT=$(echo "$TITLE_ISSUES" | head -1 | cut -d'|' -f1)

echo "  Title: \"$TITLE\""
echo "  Issues found: $TITLE_COUNT"
echo "  Most recent: #$MOST_RECENT"

if [ "$TITLE_COUNT" = "3" ] && [ "$MOST_RECENT" = "199" ]; then
  echo "  ✅ PASS: Correctly found 3 issues, most recent is #199"
else
  echo "  ❌ FAIL: Expected 3 issues with most recent #199"
  exit 1
fi
echo ""

# Test 4: Multiple duplicate issues
echo "Test 4: Multiple duplicate issues (should close all except most recent)"
echo "-----------------------------------------------------------------------"
TEST_DATA_4='124|2025-12-27T10:30:00Z|🚨 Production Deployment Failed
122|2025-12-27T10:25:00Z|🚨 Production Deployment Failed
121|2025-12-27T10:20:00Z|🚨 Production Deployment Failed
119|2025-12-27T10:15:00Z|🚨 Production Deployment Failed
117|2025-12-27T10:10:00Z|🚨 Production Deployment Failed'

TOTAL=$(echo "$TEST_DATA_4" | wc -l)
MOST_RECENT=$(echo "$TEST_DATA_4" | head -1 | cut -d'|' -f1)
TO_CLOSE=$(get_issues_to_close "$TEST_DATA_4")
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

# Test 5: Two duplicate issues
echo "Test 5: Two duplicate issues (should close oldest, keep newest)"
echo "----------------------------------------------------------------"
TEST_DATA_5='150|2025-12-27T11:00:00Z|Bug in login
148|2025-12-27T10:55:00Z|Bug in login'

TOTAL=$(echo "$TEST_DATA_5" | wc -l)
MOST_RECENT=$(echo "$TEST_DATA_5" | head -1 | cut -d'|' -f1)
TO_CLOSE=$(get_issues_to_close "$TEST_DATA_5")
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

# Test 6: Single issue
echo "Test 6: Single issue (should not close anything)"
echo "-------------------------------------------------"
TEST_DATA_6='200|2025-12-27T12:00:00Z|Unique issue'

TOTAL=$(echo "$TEST_DATA_6" | wc -l)
MOST_RECENT=$(echo "$TEST_DATA_6" | head -1 | cut -d'|' -f1)
TO_CLOSE=$(get_issues_to_close "$TEST_DATA_6" 2>&1)

echo "  Total issues found: $TOTAL"
echo "  Most recent issue: #$MOST_RECENT"

if [ -z "$(echo "$TO_CLOSE" | grep -v "Only one issue")" ]; then
  echo "  ✅ PASS: Correctly identified no issues to close (only 1 issue)"
else
  echo "  ❌ FAIL: Should not close anything with only 1 issue"
  exit 1
fi
echo ""

# Test 7: Empty input
echo "Test 7: Empty input (should handle gracefully)"
echo "----------------------------------------------"
TO_CLOSE=$(get_issues_to_close "" 2>&1)

if [ -z "$(echo "$TO_CLOSE" | grep -v "No duplicate issues")" ]; then
  echo "  ✅ PASS: Correctly handled empty input"
else
  echo "  ❌ FAIL: Should handle empty input gracefully"
  exit 1
fi
echo ""

# Test 8: No duplicates in repository
echo "Test 8: No duplicates (all unique titles)"
echo "-----------------------------------------"
TEST_DATA_8='300|2025-12-27T15:00:00Z|Issue C
299|2025-12-27T14:00:00Z|Issue B
298|2025-12-27T13:00:00Z|Issue A'

DUPLICATES=$(find_duplicate_titles "$TEST_DATA_8" "")

if [ -z "$DUPLICATES" ]; then
  echo "  ✅ PASS: Correctly found no duplicates"
else
  echo "  ❌ FAIL: Should find no duplicates with all unique titles"
  exit 1
fi
echo ""

echo "============================================="
echo "✅ All tests passed!"
echo ""
echo "Summary:"
echo "  - Smart duplicate detection works correctly"
echo "  - Multiple duplicate groups are identified"
echo "  - Title filtering works as expected"
echo "  - Correctly identifies most recent issue"
echo "  - Closes all duplicates except the most recent"
echo "  - Handles edge cases (single issue, empty input)"
echo "  - Properly detects when no duplicates exist"
