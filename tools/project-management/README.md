# Project Management Tools

Tools for managing MetaBuilder's GitHub project board and issues.

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

**5. Create only high priority issues**
```bash
# First export to JSON
python3 populate-kanban.py --output all-issues.json

# Filter and create (requires jq)
cat all-issues.json | jq '[.[] | select(.priority == "🟠 High")]' > high-priority.json
# Then manually create from filtered JSON
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

### See Also

- [docs/todo/README.md](../../docs/todo/README.md) - TODO system overview
- [docs/todo/TODO_STATUS.md](../../docs/todo/TODO_STATUS.md) - Current status
- [GitHub Projects](https://github.com/users/johndoe6345789/projects/2) - Target kanban board
