# Converting TODO Items to GitHub Issues

This guide explains how to convert TODO items from `docs/todo/` markdown files into GitHub issues.

## Overview

The MetaBuilder repository contains 775+ TODO items organized across 20+ markdown files in `docs/todo/`. The `populate-kanban.py` script can parse these files and create GitHub issues automatically.

## Quick Start

### Using npm Scripts (Recommended)

From the repository root:

```bash
# Preview first 10 issues that would be created
npm run todos:preview

# Run tests to verify the script works
npm run todos:test

# Export all TODOs to JSON for review
npm run todos:export

# Export only critical priority items
npm run todos:export-critical

# Export with checklist items excluded
npm run todos:export-filtered

# Show all available options
npm run todos:help
```

### Creating Issues on GitHub

**⚠️ Warning**: This will create 775 issues (or fewer if filtered). Make sure you're ready!

```bash
# Authenticate with GitHub CLI first
gh auth login

# Preview what will be created (dry-run)
python3 tools/project-management/populate-kanban.py --dry-run --limit 10

# Create all issues (takes 15-20 minutes)
npm run todos:create

# Or create with filters
python3 tools/project-management/populate-kanban.py --create --filter-priority critical
python3 tools/project-management/populate-kanban.py --create --filter-label security --limit 20
python3 tools/project-management/populate-kanban.py --create --exclude-checklist
```

## Features

### Filtering Options

#### By Priority

```bash
# Critical items only (40 items)
python3 tools/project-management/populate-kanban.py --filter-priority critical --output critical.json

# High priority items (386 items)
python3 tools/project-management/populate-kanban.py --filter-priority high --output high.json

# Medium priority items (269 items)
python3 tools/project-management/populate-kanban.py --filter-priority medium --output medium.json

# Low priority items (80 items)
python3 tools/project-management/populate-kanban.py --filter-priority low --output low.json
```

#### By Label

```bash
# Security-related items
python3 tools/project-management/populate-kanban.py --filter-label security --output security.json

# DBAL items
python3 tools/project-management/populate-kanban.py --filter-label dbal --output dbal.json

# Frontend items
python3 tools/project-management/populate-kanban.py --filter-label frontend --output frontend.json
```

#### Exclude Checklist Items

Some TODO files contain checklist items like "Done Criteria" that are more like templates than actual tasks. Exclude them:

```bash
# Excludes items from sections: Done Criteria, Quick Wins, Sanity Check, Checklist
python3 tools/project-management/populate-kanban.py --exclude-checklist --output filtered.json
# This reduces 775 items to ~763 items
```

### Combining Filters

```bash
# Critical security items only
python3 tools/project-management/populate-kanban.py \
  --filter-priority critical \
  --filter-label security \
  --output critical-security.json

# High priority frontend items, excluding checklists
python3 tools/project-management/populate-kanban.py \
  --filter-priority high \
  --filter-label frontend \
  --exclude-checklist \
  --output high-frontend.json
```

## What Gets Created

Each GitHub issue includes:

- **Title**: First 100 characters of the TODO item
- **Body**: 
  - File path where TODO is located
  - Section within that file
  - Line number
  - Context (nearby TODO items)
  - The full TODO text
- **Labels**: Automatically assigned based on file location and name
  - Category labels: `core`, `infrastructure`, `feature`, `enhancement`
  - Domain labels: `dbal`, `frontend`, `backend`, `security`, `database`, etc.
  - Priority label: `🔴 Critical`, `🟠 High`, `🟡 Medium`, or `🟢 Low`

### Example Issue

**Title**: `Add password strength requirements`

**Body**:
```markdown
**File:** `docs/todo/infrastructure/10-SECURITY-TODO.md`
**Section:** Authentication
**Line:** 11

**Context:**
- [x] Add unit tests for security-scanner.ts ✅ (24 parameterized tests)
- [ ] Implement secure password hashing (verify SHA-512 implementation)
- [ ] Add password strength requirements

**Task:** Add password strength requirements
```

**Labels**: `security`, `infrastructure`, `🔴 Critical`

## Statistics

Total items by category:
- **Total**: 775 items
- **Critical**: 40 items (5%)
- **High**: 386 items (50%)
- **Medium**: 269 items (35%)
- **Low**: 80 items (10%)

Top labels:
1. `feature` (292) - New features
2. `workflow` (182) - SDLC improvements
3. `core` (182) - Core functionality
4. `enhancement` (160) - Improvements
5. `infrastructure` (141) - DevOps

## Testing

Run the test suite to verify everything works:

```bash
npm run todos:test
```

This runs 15 unit tests covering:
- Parsing TODO items from markdown
- Priority assignment
- Label categorization
- Filtering logic
- File exclusion rules
- Context extraction

## Advanced Usage

### Export to JSON for Manual Review

```bash
# Export all items
npm run todos:export

# Review the JSON
cat todos.json | jq '.[0]'

# Count items by priority
cat todos.json | jq '[.[] | .priority] | group_by(.) | map({priority: .[0], count: length})'

# Filter in JSON with jq
cat todos.json | jq '[.[] | select(.priority == "🔴 Critical")]' > critical-only.json
```

### Batch Creation

To avoid rate limiting, create issues in batches:

```bash
# First 50 items
python3 tools/project-management/populate-kanban.py --create --limit 50

# Wait a few minutes, then continue with next batch
# Note: Will create duplicates of first 50, so track carefully!
```

Better approach - create filtered sets:

```bash
# Step 1: Create critical items
python3 tools/project-management/populate-kanban.py --create --filter-priority critical

# Step 2: Create high priority items
python3 tools/project-management/populate-kanban.py --create --filter-priority high

# And so on...
```

### Add to GitHub Project

If you have a GitHub project board:

```bash
# Find your project ID
gh project list --owner johndoe6345789

# Create issues and add to project
python3 tools/project-management/populate-kanban.py --create --project-id 2
```

## Troubleshooting

### GitHub CLI Not Authenticated

```bash
gh auth status
# If not authenticated:
gh auth login
```

### Rate Limiting

GitHub has rate limits. If you hit them:
- Wait 15-30 minutes
- Use `--limit` to create fewer issues at once
- Use filters to create smaller batches

### Duplicate Issues

If you accidentally create duplicates:
```bash
# List recent issues
gh issue list --limit 100

# Close duplicates
gh issue close 123 --reason "duplicate"
```

### Testing Without Creating

Always use `--dry-run` first:
```bash
python3 tools/project-management/populate-kanban.py --dry-run --limit 5
```

## Updating TODOs After Creating Issues

After creating GitHub issues, you can:

1. **Mark TODOs as done** with issue reference:
   ```markdown
   - [x] Add password strength requirements (#123)
   ```

2. **Update TODO with issue link**:
   ```markdown
   - [ ] Add password strength requirements (see issue #123)
   ```

3. **Remove TODO** (since it's now tracked as an issue):
   - Delete the line from the TODO file
   - Run `npm run todos:scan` to update reports

## Related Documentation

- [KANBAN_READY.md](/KANBAN_READY.md) - Original implementation documentation
- [tools/project-management/README.md](/tools/project-management/README.md) - Script technical reference
- [docs/todo/README.md](/docs/todo/README.md) - TODO organization guide

## See Also

- [GitHub CLI documentation](https://cli.github.com/manual/)
- [GitHub Projects documentation](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
- [Markdown checklist syntax](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/about-task-lists)
