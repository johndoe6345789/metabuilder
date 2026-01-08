#!/bin/bash

# Script to bulk-close duplicate issues found via GitHub API
# Automatically finds all duplicate issue titles and closes all except the most recent one
#
# Usage:
#   export GITHUB_TOKEN="ghp_your_token_here"
#   ./triage-duplicate-issues.sh
#
# Or with custom search pattern (optional):
#   export GITHUB_TOKEN="ghp_your_token_here"
#   export SEARCH_TITLE="Custom Issue Title"
#   ./triage-duplicate-issues.sh
#
# The script will:
# 1. Fetch all open issues in the repository
# 2. Group issues by exact title match
# 3. For each group with 2+ issues, keep the most recent and close the rest
# 4. Close all duplicates with an explanatory comment

set -e

usage() {
  echo "Usage: $0 [--dry-run]"
  echo ""
  echo "Arguments:"
  echo "  --dry-run        Show what would be closed without actually closing issues"
  echo ""
  echo "Environment variables:"
  echo "  GITHUB_TOKEN     (required) GitHub personal access token with repo access"
  echo "  SEARCH_TITLE     (optional) If set, only process duplicates matching this specific title"
  echo "                   If not set, automatically detects and processes ALL duplicate titles"
  echo ""
  echo "Examples:"
  echo "  # Auto-detect and close all duplicates"
  echo "  export GITHUB_TOKEN='ghp_xxxxxxxxxxxx'"
  echo "  $0"
  echo ""
  echo "  # Dry run to see what would be closed"
  echo "  export GITHUB_TOKEN='ghp_xxxxxxxxxxxx'"
  echo "  $0 --dry-run"
  echo ""
  echo "  # Only process specific title"
  echo "  export GITHUB_TOKEN='ghp_xxxxxxxxxxxx'"
  echo "  export SEARCH_TITLE='⚠️ Pre-Deployment Validation Failed'"
  echo "  $0"
  exit 1
}

# Parse command line arguments
DRY_RUN=false
if [ "$1" = "--dry-run" ]; then
  DRY_RUN=true
  echo "🔍 DRY RUN MODE: No issues will be closed"
  echo ""
fi

# Check for help flag
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
  usage
fi

if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ GITHUB_TOKEN environment variable is required"
  echo ""
  usage
fi

OWNER="johndoe6345789"
REPO="metabuilder"

# Optional: Search pattern for specific title (if not set, processes all duplicates)
SEARCH_TITLE="${SEARCH_TITLE:-}"

# Function to fetch ALL open issues in the repository
fetch_all_open_issues() {
  echo "🔍 Fetching all open issues from repository..." >&2
  
  local all_issues=""
  local page=1
  local per_page=100
  
  while true; do
    local response
    response=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
      -H "Accept: application/vnd.github.v3+json" \
      "https://api.github.com/repos/$OWNER/$REPO/issues?state=open&per_page=$per_page&page=$page&sort=created&direction=desc")
    
    # Check for API errors (errors return object with .message, not array)
    if echo "$response" | jq -e 'select(.message != null) | .message' > /dev/null 2>&1; then
      local error_msg
      error_msg=$(echo "$response" | jq -r '.message')
      echo "❌ GitHub API error: $error_msg" >&2
      return 1
    fi
    
    # Check if response is empty (no more pages)
    local item_count
    item_count=$(echo "$response" | jq 'length')
    if [ "$item_count" -eq 0 ]; then
      break
    fi
    
    # Extract issue numbers, creation dates, and titles
    local page_data
    page_data=$(echo "$response" | jq -r '.[] | select(.pull_request == null) | "\(.number)|\(.created_at)|\(.title)"')
    
    if [ -n "$page_data" ]; then
      if [ -z "$all_issues" ]; then
        all_issues="$page_data"
      else
        all_issues="$all_issues"$'\n'"$page_data"
      fi
    fi
    
    # If we got fewer items than per_page, we're on the last page
    if [ "$item_count" -lt "$per_page" ]; then
      break
    fi
    
    page=$((page + 1))
  done
  
  echo "$all_issues"
}

# Function to find duplicate titles and return them grouped
find_duplicate_titles() {
  local issues_data="$1"
  local search_filter="$2"
  
  if [ -z "$issues_data" ]; then
    return 0
  fi
  
  # Extract unique titles and count occurrences
  # Format: title|count
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

# Function to get issues for a specific title, sorted by creation date (newest first)
get_issues_by_title() {
  local issues_data="$1"
  local title="$2"
  
  # Filter issues matching the exact title and sort by date (newest first)
  echo "$issues_data" | grep -F "|$title" | sort -t'|' -k2 -r
}

# Function to determine which issues to close (all except the most recent)
get_issues_to_close() {
  local issues_data="$1"
  
  if [ -z "$issues_data" ]; then
    echo "⚠️  No duplicate issues found" >&2
    return 0
  fi
  
  local total_count
  total_count=$(echo "$issues_data" | wc -l)
  
  if [ "$total_count" -le 1 ]; then
    echo "ℹ️  Only one issue found, nothing to close" >&2
    return 0
  fi
  
  # Skip the first line (most recent issue) and get the rest
  echo "$issues_data" | tail -n +2 | cut -d'|' -f1
}

# Fetch all open issues
echo "🤖 Smart Duplicate Issue Triage"
echo "==============================="
echo ""

ALL_ISSUES=$(fetch_all_open_issues)

if [ -z "$ALL_ISSUES" ]; then
  echo "✨ No open issues found in repository!"
  exit 0
fi

TOTAL_ISSUES=$(echo "$ALL_ISSUES" | wc -l)
echo "📊 Found $TOTAL_ISSUES total open issues"
echo ""

# Find duplicate titles
if [ -n "$SEARCH_TITLE" ]; then
  echo "🔎 Filtering for specific title: \"$SEARCH_TITLE\""
  DUPLICATE_TITLES=$(find_duplicate_titles "$ALL_ISSUES" "$SEARCH_TITLE")
else
  echo "🔎 Automatically detecting duplicate titles..."
  DUPLICATE_TITLES=$(find_duplicate_titles "$ALL_ISSUES" "")
fi

if [ -z "$DUPLICATE_TITLES" ]; then
  echo "✨ No duplicate issues found. Repository is clean!"
  exit 0
fi

# Count how many unique titles have duplicates
DUPLICATE_TITLE_COUNT=$(echo "$DUPLICATE_TITLES" | wc -l)
echo "🎯 Found $DUPLICATE_TITLE_COUNT title(s) with duplicates"
echo ""

close_issue() {
  local issue_number=$1
  local most_recent=$2
  local most_recent_date=$3
  local title=$4
  local total_with_title=$5
  
  if [ "$DRY_RUN" = true ]; then
    echo "  [DRY RUN] Would close issue #${issue_number}"
    echo "  [DRY RUN] Would add comment explaining closure"
    echo "  ✅ Dry run complete for issue #${issue_number}"
    echo ""
    return 0
  fi
  
  local close_comment='🤖 **Automated Triage: Closing Duplicate Issue**

This issue has been identified as a duplicate. Multiple issues with the same title were found, and this script automatically closes all duplicates except the most recent one.

**Resolution:**
- ✅ Keeping the most recent issue (#'"$most_recent"') as the canonical tracking issue
- ✅ Closing this and other duplicate issues to maintain a clean issue tracker

**How duplicates were identified:**
- Title: "'"$title"'"
- Total duplicates found: '"$total_with_title"'
- Keeping most recent: Issue #'"$most_recent"' (created '"$most_recent_date"')

**No Action Required** - Please refer to issue #'"$most_recent"' for continued discussion.

---
*This closure was performed by an automated triage script. For questions, see `scripts/triage-duplicate-issues.sh`*'
  
  # Add comment explaining closure
  echo "  📝 Adding comment to issue #${issue_number}..."
  if curl -s -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$OWNER/$REPO/issues/$issue_number/comments" \
    -d "{\"body\": $(echo "$close_comment" | jq -Rs .)}" > /dev/null; then
    echo "  ✅ Added comment to issue #${issue_number}"
  else
    echo "  ❌ Failed to add comment to issue #${issue_number}"
    return 1
  fi
  
  # Close the issue
  echo "  🔒 Closing issue #${issue_number}..."
  if curl -s -X PATCH \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$OWNER/$REPO/issues/$issue_number" \
    -d '{"state": "closed", "state_reason": "not_planned"}' > /dev/null; then
    echo "  ✅ Closed issue #${issue_number}"
  else
    echo "  ❌ Failed to close issue #${issue_number}"
    return 1
  fi
  
  echo ""
}

main() {
  echo "🔧 Starting bulk issue triage..."
  echo ""
  
  local total_closed=0
  local title_index=0
  
  # Process each duplicate title
  while IFS= read -r duplicate_title; do
    title_index=$((title_index + 1))
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 Processing duplicate group $title_index/$DUPLICATE_TITLE_COUNT"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Title: \"$duplicate_title\""
    echo ""
    
    # Get all issues with this title
    TITLE_ISSUES=$(get_issues_by_title "$ALL_ISSUES" "$duplicate_title")
    TITLE_ISSUE_COUNT=$(echo "$TITLE_ISSUES" | wc -l)
    
    # Get the most recent issue
    MOST_RECENT=$(echo "$TITLE_ISSUES" | head -1 | cut -d'|' -f1)
    MOST_RECENT_DATE=$(echo "$TITLE_ISSUES" | head -1 | cut -d'|' -f2)
    
    echo "  📊 Found $TITLE_ISSUE_COUNT issues with this title"
    echo "  📌 Most recent: Issue #$MOST_RECENT (created: $MOST_RECENT_DATE)"
    echo ""
    
    # Get list of issues to close
    ISSUES_TO_CLOSE_DATA=$(get_issues_to_close "$TITLE_ISSUES")
    
    if [ -z "$ISSUES_TO_CLOSE_DATA" ]; then
      echo "  ℹ️  No duplicates to close for this title"
      echo ""
      continue
    fi
    
    # Convert to array
    ISSUES_TO_CLOSE=()
    while IFS= read -r issue_num; do
      ISSUES_TO_CLOSE+=("$issue_num")
    done <<< "$ISSUES_TO_CLOSE_DATA"
    
    if [ "$DRY_RUN" = true ]; then
      echo "  🎯 [DRY RUN] Would close ${#ISSUES_TO_CLOSE[@]} duplicate issues:"
      echo "      Issues: $(echo "${ISSUES_TO_CLOSE[@]}" | tr ' ' ',')"
    else
      echo "  🎯 Planning to close ${#ISSUES_TO_CLOSE[@]} duplicate issues"
    fi
    echo ""
    
    for issue_number in "${ISSUES_TO_CLOSE[@]}"; do
      close_issue "$issue_number" "$MOST_RECENT" "$MOST_RECENT_DATE" "$duplicate_title" "$TITLE_ISSUE_COUNT"
      total_closed=$((total_closed + 1))
      # Add a small delay to avoid rate limiting (skip in dry-run)
      if [ "$DRY_RUN" = false ]; then
        sleep 1
      fi
    done
    
    echo "  ✅ Completed processing this duplicate group"
    echo ""
  done <<< "$DUPLICATE_TITLES"
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  if [ "$DRY_RUN" = true ]; then
    echo "✨ Dry run complete!"
  else
    echo "✨ Triage complete!"
  fi
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "📊 Summary:"
  echo "  • Processed $DUPLICATE_TITLE_COUNT duplicate title group(s)"
  if [ "$DRY_RUN" = true ]; then
    echo "  • Would close $total_closed duplicate issue(s)"
    echo "  • Would keep the most recent issue open for each title"
    echo ""
    echo "💡 To actually close these issues, run without --dry-run flag"
  else
    echo "  • Closed $total_closed duplicate issue(s)"
    echo "  • Kept the most recent issue open for each title"
  fi
  echo ""
}

main
