# Populating the GitHub Kanban Board

This guide shows how to populate the MetaBuilder GitHub project board (https://github.com/users/johndoe6345789/projects/2) with issues from the TODO files.

## Quick Start (3 Steps)

### Step 1: Authenticate with GitHub

```bash
gh auth login
```

Follow the prompts to authenticate. Choose:
- GitHub.com (not GitHub Enterprise)
- HTTPS protocol
- Login with a web browser (recommended)

### Step 2: Preview Issues (Recommended)

Before creating hundreds of issues, do a dry run:

```bash
cd /path/to/metabuilder
python3 tools/project-management/populate-kanban.py --dry-run --limit 10
```

This shows you what the first 10 issues would look like.

### Step 3: Create All Issues

**Warning**: This creates 775 issues and will take 15-20 minutes.

```bash
python3 tools/project-management/populate-kanban.py --create --project-id 2
```

The script will:
1. Parse all TODO files in `docs/todo/`
2. Create a GitHub issue for each unchecked TODO item
3. Add appropriate labels (core, infrastructure, feature, etc.)
4. Add priority labels (🔴 Critical, 🟠 High, 🟡 Medium, 🟢 Low)
5. Add each issue to project #2
6. Pause periodically to avoid rate limiting

## Alternative Approaches

### Create Issues in Batches

If you want more control, create issues in smaller batches:

```bash
# Export all issues to JSON first
python3 tools/project-management/populate-kanban.py --output all-issues.json

# Then create in batches using the --limit flag
# First 100 issues
python3 tools/project-management/populate-kanban.py --create --limit 100

# Wait a bit, then continue...
# (Note: You'd need to modify the script to support offset/skip)
```

### Create Only High Priority Issues

```bash
# First export to JSON
python3 tools/project-management/populate-kanban.py --output all-issues.json

# Filter for critical and high priority
cat all-issues.json | jq '[.[] | select(.priority == "🔴 Critical" or .priority == "🟠 High")]' > high-priority.json

# This gives you 426 high-priority items
# You'll need to write a small script to create from this filtered JSON
```

### Manual Review Before Creating

```bash
# Export to JSON
python3 tools/project-management/populate-kanban.py --output issues.json

# Review the issues
cat issues.json | jq '.[] | {title, priority, labels, file}' | less

# If satisfied, create them
python3 tools/project-management/populate-kanban.py --create
```

## What Gets Created

Each TODO item from the markdown files becomes a GitHub issue with:

**Title**: The TODO text (truncated to 100 chars if needed)

**Body**: Contains:
- Source file path
- Section within the file
- Line number
- Context from surrounding items
- The full task description

**Labels**: Automatically assigned based on:
- File location (core, infrastructure, features, improvements)
- Filename content (dbal, frontend, security, testing, etc.)
- Priority level from README

**Example Issue**:

```markdown
Title: Run `npm run act:diagnose` and `npm run act` to validate local GitHub Actions testing

Body:
**File:** `docs/todo/core/1-TODO.md`
**Section:** Quick Wins
**Line:** 7

**Task:** Run `npm run act:diagnose` and `npm run act` to validate local GitHub Actions testing

Labels: workflow, core, 🟠 High
```

## Statistics

The script will create approximately:

- **Total issues**: 775
- **By priority**:
  - 🔴 Critical: 40 issues
  - 🟠 High: 386 issues
  - 🟡 Medium: 269 issues
  - 🟢 Low: 80 issues
- **By category**:
  - Feature: 292 issues
  - Workflow/Core: 182 issues
  - Enhancement: 160 issues
  - Infrastructure: 141 issues
  - SDLC: 127 issues
  - And more...

## Troubleshooting

### "You are not logged into any GitHub hosts"

**Solution**: Run `gh auth login` first

### "Rate limit exceeded"

**Solution**: The script includes automatic pausing. If you still hit limits:
1. Wait 15-30 minutes
2. Use `--limit` to create fewer issues at once

### "Project not found"

**Solution**: Verify the project ID:
```bash
gh project list --owner johndoe6345789
```

Then use the correct ID:
```bash
python3 tools/project-management/populate-kanban.py --create --project-id <correct-id>
```

### Want to test first?

Always safe to use `--dry-run`:
```bash
python3 tools/project-management/populate-kanban.py --dry-run
```

## Cleanup (If Needed)

If you need to remove issues:

```bash
# List all open issues
gh issue list --repo johndoe6345789/metabuilder --limit 1000

# Close issues in bulk (requires jq)
gh issue list --repo johndoe6345789/metabuilder --limit 1000 --json number \
  | jq -r '.[] | .number' \
  | xargs -I {} gh issue close {} --repo johndoe6345789/metabuilder
```

## Next Steps After Population

Once issues are created:

1. **Triage**: Review and adjust priorities/labels as needed
2. **Milestones**: Group issues into milestones for releases
3. **Assignments**: Assign issues to team members
4. **Project board**: Organize columns (Backlog, In Progress, Done)
5. **Labels**: Add custom labels if needed (bug, documentation, etc.)

## See Also

- [tools/project-management/README.md](../tools/project-management/README.md) - Detailed script documentation
- [docs/todo/README.md](../docs/todo/README.md) - TODO system overview
- [GitHub Project](https://github.com/users/johndoe6345789/projects/2) - Target kanban board
