# Duplicate Issue Triage Script

## Overview

The `triage-duplicate-issues.sh` script is a **smart** automated tool that finds and closes duplicate issues in the repository. Unlike manual triage, this script:

- ✅ **Auto-detects** all duplicate issue titles without manual configuration
- ✅ **Handles multiple groups** of duplicates in a single run
- ✅ **Keeps the most recent** issue open for each duplicate group
- ✅ **Adds explanatory comments** before closing duplicates
- ✅ **Supports dry-run mode** for safe testing

## Problem It Solves

When automated systems create multiple issues with the same title (e.g., deployment failures), you end up with many duplicate issues that clutter the issue tracker. This script automatically detects and closes them, keeping only the most recent one.

### Before
```
Issues:
  #199 ⚠️ Pre-Deployment Validation Failed (most recent)
  #195 ⚠️ Pre-Deployment Validation Failed (duplicate)
  #194 ⚠️ Pre-Deployment Validation Failed (duplicate)
  ... 26 more duplicates
```

### After
```
Issues:
  #199 ⚠️ Pre-Deployment Validation Failed (open)
  #195 ⚠️ Pre-Deployment Validation Failed (closed - duplicate)
  #194 ⚠️ Pre-Deployment Validation Failed (closed - duplicate)
  ... 26 more closed with explanation
```

## Usage

### Basic Usage (Auto-detect all duplicates)

```bash
export GITHUB_TOKEN="ghp_your_token_here"
./scripts/triage-duplicate-issues.sh
```

This will:
1. Fetch all open issues in the repository
2. Group them by exact title match
3. For each group with 2+ issues, close all except the most recent
4. Add a comment explaining why each duplicate was closed

### Dry Run (Preview without closing)

**Always test with dry-run first!**

```bash
export GITHUB_TOKEN="ghp_your_token_here"
./scripts/triage-duplicate-issues.sh --dry-run
```

This shows exactly what would be closed without actually closing anything.

### Filter by Specific Title

If you only want to close duplicates of a specific title:

```bash
export GITHUB_TOKEN="ghp_your_token_here"
export SEARCH_TITLE="⚠️ Pre-Deployment Validation Failed"
./scripts/triage-duplicate-issues.sh
```

### Get Help

```bash
./scripts/triage-duplicate-issues.sh --help
```

## How It Works

### 1. Fetch All Open Issues
The script fetches all open issues using the GitHub API, handling pagination automatically.

### 2. Group by Title
Issues are grouped by exact title match. Only groups with 2+ issues are considered duplicates.

### 3. Sort by Date
Within each group, issues are sorted by creation date (newest first).

### 4. Close Duplicates
For each group:
- Keep the most recent issue open (canonical issue)
- Close all older duplicates
- Add an explanatory comment with a link to the canonical issue

### 5. Summary Report
At the end, the script shows:
- Number of duplicate groups processed
- Total number of issues closed
- Summary of what was done

## Example Output

```
🤖 Smart Duplicate Issue Triage
===============================

🔍 Fetching all open issues from repository...
📊 Found 31 total open issues

🔎 Automatically detecting duplicate titles...
🎯 Found 1 title(s) with duplicates

🔧 Starting bulk issue triage...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Processing duplicate group 1/1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title: "⚠️ Pre-Deployment Validation Failed"

  📊 Found 29 issues with this title
  📌 Most recent: Issue #199 (created: 2025-12-27T18:12:06Z)

  🎯 Planning to close 28 duplicate issues

  📝 Adding comment to issue #195...
  ✅ Added comment to issue #195
  🔒 Closing issue #195...
  ✅ Closed issue #195

  [... continues for all duplicates ...]

  ✅ Completed processing this duplicate group

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Triage complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Summary:
  • Processed 1 duplicate title group(s)
  • Closed 28 duplicate issue(s)
  • Kept the most recent issue open for each title
```

## Requirements

- `bash` 4.0+
- `curl` (for GitHub API calls)
- `jq` (for JSON parsing)
- GitHub Personal Access Token with `repo` scope

## Testing

The script includes comprehensive tests:

```bash
./scripts/test-triage-logic.sh
```

This runs 8 test cases covering:
- Smart duplicate detection
- Multiple duplicate groups
- Title filtering
- Edge cases (single issue, empty input, no duplicates)

## Safety Features

1. **Dry-run mode**: Test before closing anything
2. **API error handling**: Graceful failure on API errors
3. **Pagination**: Handles repositories with 100+ issues
4. **Explanatory comments**: Each closed issue gets a comment explaining why
5. **Rate limiting**: 1-second delay between closures to avoid API limits
6. **Most recent preserved**: Always keeps the newest issue open

## Common Use Cases

### Automated Deployment Failure Issues
When CI/CD creates multiple issues for deployment failures:
```bash
export GITHUB_TOKEN="ghp_xxxx"
export SEARCH_TITLE="🚨 Production Deployment Failed"
./scripts/triage-duplicate-issues.sh --dry-run  # Preview first
./scripts/triage-duplicate-issues.sh            # Then execute
```

### Clean Up All Duplicates
If your repository has multiple types of duplicate issues:
```bash
export GITHUB_TOKEN="ghp_xxxx"
./scripts/triage-duplicate-issues.sh --dry-run  # Preview all
./scripts/triage-duplicate-issues.sh            # Close all
```

### Scheduled Cleanup
Add to cron or GitHub Actions:
```yaml
# .github/workflows/triage-duplicates.yml
name: Triage Duplicate Issues
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  workflow_dispatch:       # Manual trigger

jobs:
  triage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Triage duplicates
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: ./scripts/triage-duplicate-issues.sh
```

## Troubleshooting

### "Bad credentials" error
Make sure your `GITHUB_TOKEN` has the `repo` scope and is not expired.

### "jq: command not found"
Install jq:
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# RHEL/CentOS
sudo yum install jq
```

### No duplicates found
The script only detects issues with **exact** title matches. Similar but not identical titles won't be grouped together.

### Rate limiting
If you hit rate limits, the script includes a 1-second delay between API calls. For large batches, you may need to wait or increase the delay.

## Contributing

Improvements welcome! Some ideas:
- [ ] Support fuzzy title matching (similar but not exact)
- [ ] Add interactive mode to confirm each closure
- [ ] Support closing by label or other criteria
- [ ] Add GitHub Actions integration

## License

Same as the repository (see root LICENSE file).
