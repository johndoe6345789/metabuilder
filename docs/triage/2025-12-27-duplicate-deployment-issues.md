# Issue Triage - December 2025

## Summary

On December 27, 2025, 20 duplicate "🚨 Production Deployment Failed - Rollback Required" issues (#92-#122, excluding skipped numbers) were created by a misconfigured workflow.

## Root Cause

The `gated-deployment.yml` workflow had an incorrect condition in the `rollback-preparation` job:

**Before (incorrect):**
```yaml
rollback-preparation:
  needs: [deploy-production]
  if: failure()
```

This caused the rollback job to run when ANY upstream job failed, including pre-deployment validation failures.

**After (correct):**
```yaml
rollback-preparation:
  needs: [deploy-production]
  if: needs.deploy-production.result == 'failure'
```

Now it only runs when the `deploy-production` job actually fails.

## Issue Breakdown

- **Issues #92-#122** (21 issues, excluding skipped numbers): Duplicate false-positive rollback issues
- **Issue #124**: Kept open as the canonical tracking issue with explanation
- **Issue #24**: Renovate Dependency Dashboard (legitimate, unrelated)

## Resolution

### 1. Workflow Fixed ✅
- Commit: [c13c862](../../commit/c13c862)
- File: `.github/workflows/gated-deployment.yml`
- Change: Updated `rollback-preparation` job condition

### 2. Bulk Closure Process

A script was created to close the duplicate issues: `scripts/triage-duplicate-issues.sh`

**The script now dynamically finds and closes duplicates:**

```bash
# Set your GitHub token (needs repo write access)
export GITHUB_TOKEN="your_github_token_here"

# Run the script (uses default search pattern)
./scripts/triage-duplicate-issues.sh

# Or with a custom search pattern
export SEARCH_TITLE="Your custom issue title pattern"
./scripts/triage-duplicate-issues.sh
```

**The script will:**
1. Search for all open issues matching the title pattern using GitHub API
2. Sort issues by creation date (newest first)
3. Keep the most recent issue open
4. Add an explanatory comment to each older duplicate issue
5. Close duplicate issues with state_reason "not_planned"

**Key Features:**
- ✅ Dynamic duplicate detection (no hardcoded issue numbers)
- ✅ Automatically keeps the most recent issue open
- ✅ Configurable search pattern via environment variable
- ✅ Uses GitHub API search for accurate results

## Issues Closed

Total: 21 duplicate issues

- #92, #93, #95, #96, #97, #98, #99, #100, #101, #102
- #104, #105, #107, #108, #111, #113, #115, #117, #119, #121, #122

## Issues Kept Open

- **#124**: Most recent deployment failure issue - keeping as canonical tracking issue
- **#24**: Renovate Dependency Dashboard - legitimate automated issue

## Impact

**No actual production deployments failed.** All issues were false positives triggered by pre-deployment validation failures (specifically, Prisma client generation errors).

## Prevention

The workflow fix ensures future issues will only be created when:
1. A deployment to production actually occurs
2. That deployment fails

Pre-deployment validation failures will no longer trigger rollback issue creation.

## Verification

After running the triage script, verify:
- [ ] 21 issues (#92-#122, excluding some numbers) are closed
- [ ] Each closed issue has an explanatory comment
- [ ] Issue #124 remains open
- [ ] Issue #24 (Renovate) remains open
- [ ] No new false-positive rollback issues are created on future commits
