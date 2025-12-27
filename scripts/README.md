# Scripts Directory

This directory contains utility scripts for the MetaBuilder project.

## Scripts

### `triage-duplicate-issues.sh`

**Purpose:** Automatically finds and closes duplicate GitHub issues while keeping the most recent one open.

**Features:**
- 🔍 Dynamically searches for duplicate issues using GitHub API
- 📅 Sorts issues by creation date (newest first)
- ✅ Keeps the most recent issue open as the canonical tracking issue
- 🔒 Closes all older duplicates with explanatory comments
- ⚙️ Configurable search pattern via environment variables
- 🛡️ Error handling and rate limiting protection

**Usage:**
```bash
# Basic usage (uses default search pattern)
export GITHUB_TOKEN="ghp_your_github_token_here"
./scripts/triage-duplicate-issues.sh

# With custom search pattern
export GITHUB_TOKEN="ghp_your_github_token_here"
export SEARCH_TITLE="Your custom issue title"
./scripts/triage-duplicate-issues.sh

# Show help
./scripts/triage-duplicate-issues.sh --help
```

**Environment Variables:**
- `GITHUB_TOKEN` (required): GitHub personal access token with `repo` access
- `SEARCH_TITLE` (optional): Issue title pattern to search for
  - Default: `"🚨 Production Deployment Failed - Rollback Required"`

**How it works:**
1. Searches GitHub API for all open issues matching the title pattern
2. Sorts issues by creation date (newest first)
3. Identifies the most recent issue to keep open
4. Adds an explanatory comment to each older duplicate
5. Closes older duplicates with `state_reason: "not_planned"`

**Example output:**
```
🔍 Searching for issues with title: "🚨 Production Deployment Failed - Rollback Required"
📊 Found 5 duplicate issues
📌 Most recent issue: #124 (created: 2025-12-27T10:30:00Z)

🔧 Starting bulk issue triage...
📋 Planning to close 4 duplicate issues
📌 Keeping issue #124 open (most recent)

📝 Adding comment to issue #122...
✅ Added comment to issue #122
🔒 Closing issue #122...
✅ Closed issue #122
...
✨ Triage complete!
```

---

### `test-triage-logic.sh`

**Purpose:** Comprehensive test suite for the triage script logic.

**Features:**
- ✅ Tests multiple duplicate issues handling
- ✅ Tests two duplicate issues
- ✅ Tests single issue (should not close)
- ✅ Tests empty input handling
- ✅ Validates date sorting
- ✅ Tests jq parsing and formatting

**Usage:**
```bash
./scripts/test-triage-logic.sh
```

**Example output:**
```
🧪 Testing triage-duplicate-issues.sh logic
=============================================

Test 1: Multiple duplicate issues (should close all except most recent)
-----------------------------------------------------------------------
  Total issues found: 5
  Most recent issue: #124
  Issues to close: 122 121 119 117 
  Count to close: 4
  ✅ PASS: Correctly identified most recent and 4 issues to close
...
=============================================
✅ All tests passed!
```

---

### `generate_mod.py`

**Purpose:** Python script for generating module files.

---

## Development Guidelines

### Adding New Scripts

When adding new scripts to this directory:

1. **Use descriptive names** that clearly indicate the script's purpose
2. **Add executable permissions**: `chmod +x script-name.sh`
3. **Include usage documentation** in the script header
4. **Add help flag support** (`--help` or `-h`)
5. **Handle errors gracefully** with proper exit codes
6. **Update this README** with script documentation

### Testing Scripts

- Run `shellcheck` on bash scripts before committing
- Create test scripts for complex logic
- Validate with sample data before using in production
- Test edge cases (empty input, single item, etc.)

### Best Practices

- ✅ Use `set -e` to exit on errors
- ✅ Validate required environment variables
- ✅ Add descriptive comments
- ✅ Use meaningful variable names
- ✅ Include usage examples
- ✅ Handle rate limiting for API calls
- ✅ Provide clear error messages

---

## Related Documentation

- [Triage Summary](../docs/triage/TRIAGE_SUMMARY.md)
- [Duplicate Issues Documentation](../docs/triage/2025-12-27-duplicate-deployment-issues.md)
