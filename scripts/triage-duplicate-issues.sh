#!/bin/bash

# Script to bulk-close duplicate issues found via GitHub API
# Dynamically finds issues with duplicate titles and closes all except the most recent one
#
# Usage:
#   export GITHUB_TOKEN="ghp_your_token_here"
#   ./triage-duplicate-issues.sh
#
# Or with custom search pattern:
#   export GITHUB_TOKEN="ghp_your_token_here"
#   export SEARCH_TITLE="Custom Issue Title"
#   ./triage-duplicate-issues.sh
#
# The script will:
# 1. Search for all open issues matching the SEARCH_TITLE pattern
# 2. Sort them by creation date (newest first)
# 3. Keep the most recent issue open
# 4. Close all other duplicates with an explanatory comment

set -e

usage() {
  echo "Usage: $0"
  echo ""
  echo "Environment variables:"
  echo "  GITHUB_TOKEN     (required) GitHub personal access token with repo access"
  echo "  SEARCH_TITLE     (optional) Issue title pattern to search for"
  echo "                   Default: '🚨 Production Deployment Failed - Rollback Required'"
  echo ""
  echo "Example:"
  echo "  export GITHUB_TOKEN='ghp_xxxxxxxxxxxx'"
  echo "  export SEARCH_TITLE='Duplicate bug report'"
  echo "  $0"
  exit 1
}

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

# Search pattern for duplicate issues (can be customized)
SEARCH_TITLE="${SEARCH_TITLE:-🚨 Production Deployment Failed - Rollback Required}"

# Function to fetch issues by title pattern
fetch_duplicate_issues() {
  local search_query="$1"
  echo "🔍 Searching for issues with title: \"$search_query\"" >&2
  
  # Use GitHub API to search for issues by title
  # Filter by: is:issue, is:open, repo, and title match
  local encoded_query
  encoded_query=$(echo "is:issue is:open repo:$OWNER/$REPO in:title $search_query" | jq -sRr @uri)
  
  local response
  response=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/search/issues?q=$encoded_query&sort=created&order=desc&per_page=100")
  
  # Check for API errors
  if echo "$response" | jq -e '.message' > /dev/null 2>&1; then
    local error_msg
    error_msg=$(echo "$response" | jq -r '.message')
    echo "❌ GitHub API error: $error_msg" >&2
    return 1
  fi
  
  # Extract issue numbers and creation dates, sorted by creation date (newest first)
  echo "$response" | jq -r '.items | sort_by(.created_at) | reverse | .[] | "\(.number)|\(.created_at)|\(.title)"'
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

# Fetch all duplicate issues
ISSUES_DATA=$(fetch_duplicate_issues "$SEARCH_TITLE")

if [ -z "$ISSUES_DATA" ]; then
  echo "✨ No duplicate issues found. Nothing to do!"
  exit 0
fi

# Parse the data
TOTAL_ISSUES=$(echo "$ISSUES_DATA" | wc -l)
MOST_RECENT=$(echo "$ISSUES_DATA" | head -1 | cut -d'|' -f1)
MOST_RECENT_DATE=$(echo "$ISSUES_DATA" | head -1 | cut -d'|' -f2)

echo "📊 Found $TOTAL_ISSUES duplicate issues"
echo "📌 Most recent issue: #$MOST_RECENT (created: $MOST_RECENT_DATE)"
echo ""

# Get list of issues to close
ISSUES_TO_CLOSE_DATA=$(get_issues_to_close "$ISSUES_DATA")

if [ -z "$ISSUES_TO_CLOSE_DATA" ]; then
  echo "✨ No issues need to be closed!"
  exit 0
fi

# Convert to array
ISSUES_TO_CLOSE=()
while IFS= read -r issue_num; do
  ISSUES_TO_CLOSE+=("$issue_num")
done <<< "$ISSUES_TO_CLOSE_DATA"

CLOSE_COMMENT='🤖 **Automated Triage: Closing Duplicate Issue**

This issue has been identified as a duplicate. Multiple issues with the same title were found, and this script automatically closes all duplicates except the most recent one.

**Resolution:**
- ✅ Keeping the most recent issue (#'"$MOST_RECENT"') as the canonical tracking issue
- ✅ Closing this and other duplicate issues to maintain a clean issue tracker

**How duplicates were identified:**
- Search pattern: "'"$SEARCH_TITLE"'"
- Total duplicates found: '"$TOTAL_ISSUES"'
- Keeping most recent: Issue #'"$MOST_RECENT"' (created '"$MOST_RECENT_DATE"')

**No Action Required** - Please refer to issue #'"$MOST_RECENT"' for continued discussion.

---
*This closure was performed by an automated triage script. For questions, see `scripts/triage-duplicate-issues.sh`*'

close_issue() {
  local issue_number=$1
  
  # Add comment explaining closure
  echo "📝 Adding comment to issue #${issue_number}..."
  if curl -s -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$OWNER/$REPO/issues/$issue_number/comments" \
    -d "{\"body\": $(echo "$CLOSE_COMMENT" | jq -Rs .)}" > /dev/null; then
    echo "✅ Added comment to issue #${issue_number}"
  else
    echo "❌ Failed to add comment to issue #${issue_number}"
    return 1
  fi
  
  # Close the issue
  echo "🔒 Closing issue #${issue_number}..."
  if curl -s -X PATCH \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$OWNER/$REPO/issues/$issue_number" \
    -d '{"state": "closed", "state_reason": "not_planned"}' > /dev/null; then
    echo "✅ Closed issue #${issue_number}"
  else
    echo "❌ Failed to close issue #${issue_number}"
    return 1
  fi
  
  echo ""
}

main() {
  echo "🔧 Starting bulk issue triage..."
  echo ""
  echo "📋 Planning to close ${#ISSUES_TO_CLOSE[@]} duplicate issues"
  echo "📌 Keeping issue #$MOST_RECENT open (most recent)"
  echo ""
  
  for issue_number in "${ISSUES_TO_CLOSE[@]}"; do
    close_issue "$issue_number"
    # Add a small delay to avoid rate limiting
    sleep 1
  done
  
  echo "✨ Triage complete!"
  echo ""
  echo "📌 Kept open: Issue #$MOST_RECENT (most recent, created $MOST_RECENT_DATE)"
  echo "🔒 Closed: ${#ISSUES_TO_CLOSE[@]} duplicate issues"
}

main
