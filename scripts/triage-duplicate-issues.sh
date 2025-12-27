#!/bin/bash

# Script to bulk-close duplicate "Production Deployment Failed" issues
# These were created by a misconfigured workflow that triggered rollback issues
# on pre-deployment validation failures rather than actual deployment failures.

set -e

GITHUB_TOKEN="${GITHUB_TOKEN}"
if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ GITHUB_TOKEN environment variable is required"
  exit 1
fi

OWNER="johndoe6345789"
REPO="metabuilder"

# Issues to close - all the duplicate deployment failure issues except the most recent (#124)
ISSUES_TO_CLOSE=(92 93 95 96 97 98 99 100 101 102 104 105 107 108 111 113 115 117 119 121 122)

CLOSE_COMMENT='🤖 **Automated Triage: Closing Duplicate Issue**

This issue was automatically created by a misconfigured workflow. The deployment workflow was creating "rollback required" issues when **pre-deployment validation** failed, not when actual deployments failed.

**Root Cause:**
- The `rollback-preparation` job had `if: failure()` which triggered when ANY upstream job failed
- It should have been `if: needs.deploy-production.result == '"'"'failure'"'"'` to only trigger on actual deployment failures

**Resolution:**
- ✅ Fixed the workflow in the latest commit
- ✅ Keeping issue #124 as the canonical tracking issue
- ✅ Closing this and other duplicate issues created by the same root cause

**No Action Required** - These were false positives and no actual production deployments failed.

---
*For questions about this automated triage, see the commit that fixed the workflow.*'

close_issue() {
  local issue_number=$1
  
  # Add comment explaining closure
  echo "📝 Adding comment to issue #${issue_number}..."
  curl -s -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$OWNER/$REPO/issues/$issue_number/comments" \
    -d "{\"body\": $(echo "$CLOSE_COMMENT" | jq -Rs .)}" > /dev/null
  
  if [ $? -eq 0 ]; then
    echo "✅ Added comment to issue #${issue_number}"
  else
    echo "❌ Failed to add comment to issue #${issue_number}"
    return 1
  fi
  
  # Close the issue
  echo "🔒 Closing issue #${issue_number}..."
  curl -s -X PATCH \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$OWNER/$REPO/issues/$issue_number" \
    -d '{"state": "closed", "state_reason": "not_planned"}' > /dev/null
  
  if [ $? -eq 0 ]; then
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
  echo ""
  
  for issue_number in "${ISSUES_TO_CLOSE[@]}"; do
    close_issue "$issue_number"
    # Add a small delay to avoid rate limiting
    sleep 1
  done
  
  echo "✨ Triage complete!"
  echo ""
  echo "📌 Keeping open:"
  echo "   - Issue #124 (most recent deployment failure - canonical tracking issue)"
  echo "   - Issue #24 (Renovate Dependency Dashboard - legitimate)"
}

main
