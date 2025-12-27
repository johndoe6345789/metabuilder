# Project Management Tools

Tools for managing MetaBuilder's GitHub project board and issues.

## Overview

This directory contains three main tools:

1. **populate-kanban.py** - Convert TODO items to GitHub issues
2. **check-new-todos.py** - Monitor for new TODO items
3. **test_populate_kanban.py** - Unit tests for the conversion script

## Quick Start

```bash
# From repository root:

# Preview issues that would be created
npm run todos:preview

# Run tests
npm run todos:test

# Check for new TODOs since baseline
npm run todos:check

# Export to JSON
npm run todos:export

# Create issues on GitHub (requires gh auth)
npm run todos:create
```

## populate-kanban.py

Automatically populate the GitHub project kanban board from TODO markdown files.

### Features

- **Parse TODO files**: Extracts unchecked TODO items from all markdown files in `docs/todo/`
- **Categorize items**: Automatically assigns labels based on file location and content
- **Priority assignment**: Maps TODO files to priority levels (Critical, High, Medium, Low)
- **GitHub integration**: Creates issues directly via GitHub CLI
- **Project board support**: Automatically adds issues to specified GitHub project
- **Flexible output**: Export to JSON or create issues directly

### Quick Start

```bash
# Preview what issues would be created (dry run)
python3 tools/project-management/populate-kanban.py --dry-run --limit 10

# Export all issues to JSON file
python3 tools/project-management/populate-kanban.py --output issues.json

# Create issues on GitHub (requires authentication)
gh auth login
python3 tools/project-management/populate-kanban.py --create

# Create issues and add to project board
python3 tools/project-management/populate-kanban.py --create --project-id 2
```

### Prerequisites

- **Python 3.7+**: Script requires Python 3.7 or higher
- **GitHub CLI**: Install `gh` for creating issues
  ```bash
  # macOS
  brew install gh
  
  # Ubuntu/Debian
  sudo apt install gh
  
  # Windows
  winget install GitHub.cli
  ```
- **Authentication**: Run `gh auth login` before creating issues

### Usage

#### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--dry-run` | Preview issues without creating them | - |
| `--output FILE` | Export issues to JSON file | - |
| `--create` | Create issues on GitHub | - |
| `--project-id ID` | Add issues to GitHub project | 2 |
| `--repo OWNER/NAME` | Target repository | johndoe6345789/metabuilder |
| `--todo-dir PATH` | Path to TODO directory | auto-detect |
| `--limit N` | Limit number of issues to create | no limit |
| `--filter-priority LEVEL` | Filter by priority: critical, high, medium, low | - |
| `--filter-label LABEL` | Filter by label (e.g., security, frontend) | - |
| `--exclude-checklist` | Exclude checklist items from "Done Criteria" sections | - |

#### Examples

**1. Test with small subset (recommended first)**
```bash
python3 populate-kanban.py --dry-run --limit 5
```

**2. Export all issues to review before creating**
```bash
python3 populate-kanban.py --output /tmp/issues.json
# Review the JSON file
cat /tmp/issues.json | jq '.[0]'
```

**3. Create all issues on GitHub**
```bash
# Authenticate first
gh auth login

# Create issues (this will take a while - 775 items!)
python3 populate-kanban.py --create
```

**4. Create issues and add to specific project**
```bash
python3 populate-kanban.py --create --project-id 2
```

**5. Filter by priority level**
```bash
# Create only critical priority issues (40 items)
python3 populate-kanban.py --create --filter-priority critical

# Create only high priority issues (386 items)
python3 populate-kanban.py --create --filter-priority high
```

**6. Filter by label**
```bash
# Create only security-related issues
python3 populate-kanban.py --create --filter-label security

# Create only frontend issues
python3 populate-kanban.py --create --filter-label frontend
```

**7. Exclude checklist items**
```bash
# Exclude "Done Criteria" and similar checklist sections (reduces to ~763 items)
python3 populate-kanban.py --create --exclude-checklist
```

**8. Combine filters**
```bash
# Critical security issues only
python3 populate-kanban.py --create --filter-priority critical --filter-label security

# High priority frontend issues, excluding checklists
python3 populate-kanban.py --create --filter-priority high --filter-label frontend --exclude-checklist
```

### Output Format

The script generates the following statistics:

```
Total TODO items found: 775

Breakdown by priority:
  🔴 Critical: 40
  🟠 High: 386
  🟡 Medium: 269
  🟢 Low: 80

Breakdown by label:
  feature: 292
  workflow: 182
  core: 182
  enhancement: 160
  infrastructure: 141
```

### Label Categories

Labels are automatically assigned based on:

1. **Directory structure**: `core/`, `infrastructure/`, `features/`, `improvements/`
2. **Filename patterns**: `dbal`, `frontend`, `security`, `testing`, etc.
3. **Priority levels**: 🔴 Critical, 🟠 High, 🟡 Medium, 🟢 Low

#### Standard Labels

| Label | Description | Source |
|-------|-------------|--------|
| `core` | Core functionality | `docs/todo/core/` |
| `infrastructure` | Infrastructure & DevOps | `docs/todo/infrastructure/` |
| `feature` | New features | `docs/todo/features/` |
| `enhancement` | Improvements | `docs/todo/improvements/` |
| `workflow` | SDLC & workflows | Filename contains workflow/sdlc |
| `dbal` | Database abstraction | Filename contains dbal |
| `frontend` | Frontend work | Filename contains frontend |
| `security` | Security issues | Filename contains security |
| `testing` | Test infrastructure | Filename contains test |
| `database` | Database work | Filename contains database/db |
| `deployment` | Deployment tasks | Filename contains deploy |
| `documentation` | Documentation | Filename contains doc |

### Priority Mapping

Priorities are assigned based on:

1. **README.md**: Quick Reference table priorities
2. **Filename patterns**: 
   - 🔴 **Critical**: security, build-fixes
   - 🟠 **High**: dbal, frontend, database, sdlc
   - 🟡 **Medium**: most feature work
   - 🟢 **Low**: future features, copilot

### Issue Format

Each created issue includes:

```markdown
**File:** `docs/todo/core/1-TODO.md`
**Section:** Quick Wins
**Line:** 7

**Task:** Run `npm run act:diagnose` and `npm run act` to validate local GitHub Actions testing
```

### Troubleshooting

#### GitHub CLI not authenticated

```bash
gh auth status
# If not authenticated:
gh auth login
```

#### Rate limiting

The script includes automatic rate limiting (pauses every 10 issues). If you hit GitHub's rate limits:

1. Wait 15-30 minutes
2. Use `--limit` to process in smaller batches
3. Export to JSON first, then create issues in batches

#### Duplicate issues

The script does not check for existing issues. Before running `--create`, either:

1. Use `--dry-run` to preview
2. Export to JSON and review
3. Clear existing issues from the project first

### Development

#### Running Tests

The script includes comprehensive unit tests:

```bash
# Run all tests
python3 test_populate_kanban.py

# Or use npm script (from repository root)
npm run todos:test
```

Tests cover:
- Parsing TODO items from markdown files
- Priority assignment logic
- Label categorization
- Filtering functionality
- Context extraction
- Edge cases and error handling

#### NPM Scripts

For convenience, add these to your workflow (from repository root):

```bash
# Preview issues
npm run todos:preview

# Run tests
npm run todos:test

# Export all TODOs
npm run todos:export

# Export only critical items
npm run todos:export-critical

# Export with filters
npm run todos:export-filtered

# Create issues on GitHub
npm run todos:create

# Show help
npm run todos:help
```

#### Adding new label categories

Edit the `_categorize_file()` method in `TodoParser` class:

```python
if 'mypattern' in filename:
    labels.append('mylabel')
```

#### Adjusting priority mapping

Edit the `_get_priority()` method in `TodoParser` class:

```python
if 'myfile' in filename.lower():
    return '🔴 Critical'
```

#### Testing changes

```bash
# Always test with dry-run first
python3 populate-kanban.py --dry-run --limit 3

# Check JSON export
python3 populate-kanban.py --output /tmp/test.json --limit 5
cat /tmp/test.json | jq '.'
```

### Statistics

From the last full parse:

- **Total TODO files**: 20
- **Total TODO items**: 775 (845 with completed items)
- **Critical priority**: 40 items
- **High priority**: 386 items
- **Medium priority**: 269 items
- **Low priority**: 80 items

---

## check-new-todos.py

Monitor for new TODO items added since the last baseline.

### Features

- **Baseline tracking**: Save current TODO state as baseline
- **Change detection**: Identify new and removed TODO items
- **Diff reporting**: Show what changed and where
- **CI integration**: Exit code indicates if new items found

### Quick Start

```bash
# Save current state as baseline
npm run todos:baseline

# Check for new items
npm run todos:check

# Or use directly:
python3 tools/project-management/check-new-todos.py --save-baseline
python3 tools/project-management/check-new-todos.py
```

### Use Cases

1. **CI/CD Integration**: Fail the build if new TODOs are added
2. **PR Reviews**: Detect if a PR adds new TODOs
3. **Project Management**: Track TODO growth over time
4. **Issue Creation**: Know exactly which items are new

### Example Output

```
============================================================
TODO Items Comparison
============================================================
Baseline count: 775
Current count:  783
Net change:     +8

New items:      8
Removed items:  0

============================================================
New TODO Items (8)
============================================================

1. Add GraphQL API support
   File: docs/todo/features/15-API-TODO.md:23
   Section: API Features
   Priority: 🟠 High
   Labels: feature, backend

2. Implement caching layer
   File: docs/todo/infrastructure/16-PERFORMANCE-TODO.md:45
   Section: Optimization
   Priority: 🟡 Medium
   Labels: infrastructure, performance

...

============================================================
💡 Tip: Create issues for these new items:
   python3 tools/project-management/populate-kanban.py --create --limit 8
============================================================
```

### CI/CD Example

```yaml
# .github/workflows/check-todos.yml
name: Check for new TODOs

on:
  pull_request:
    paths:
      - 'docs/todo/**'

jobs:
  check-todos:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check for new TODOs
        run: |
          python3 tools/project-management/check-new-todos.py
          if [ $? -eq 1 ]; then
            echo "::warning::New TODO items detected. Consider creating issues."
          fi
```

---

## test_populate_kanban.py

Comprehensive unit tests for populate-kanban.py.

### Features

- **15 test cases** covering all major functionality
- **Parser tests**: TODO extraction, context, sections
- **Categorization tests**: Labels, priorities, filters
- **Edge case handling**: Empty items, long titles, special files

### Running Tests

```bash
# Run all tests
npm run todos:test

# Or directly
python3 tools/project-management/test_populate_kanban.py

# With pytest (if installed)
pytest tools/project-management/test_populate_kanban.py -v
```

### Test Coverage

- ✅ Parse simple TODO items
- ✅ Skip empty/short items
- ✅ Extract context from surrounding lines
- ✅ Track section headers
- ✅ Track line numbers
- ✅ Categorize by filename
- ✅ Categorize by directory
- ✅ Assign priorities from README
- ✅ Assign default priorities
- ✅ Exclude special files (README, STATUS, SCAN)
- ✅ Truncate long titles
- ✅ Dry run mode
- ✅ Issue creation
- ✅ Project board integration
- ✅ Filter logic

---

## See Also

- **[docs/guides/TODO_TO_ISSUES.md](../../docs/guides/TODO_TO_ISSUES.md)** - Complete user guide
- **[docs/todo/README.md](../../docs/todo/README.md)** - TODO system overview
- **[docs/todo/TODO_STATUS.md](../../docs/todo/TODO_STATUS.md)** - Current status
- **[KANBAN_READY.md](../../KANBAN_READY.md)** - Implementation summary
- **[GitHub Projects](https://github.com/users/johndoe6345789/projects/2)** - Target kanban board
- **[.github/workflows/todo-to-issues.yml](../../.github/workflows/todo-to-issues.yml)** - GitHub Action workflow
