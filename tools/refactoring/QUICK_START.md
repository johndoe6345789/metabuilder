# 🚀 Quick Start: Auto Code Extractor 3000™

**Get started in 30 seconds!**

## Installation

No installation needed! The tool uses dependencies already in the project.

## Usage

### 1. Preview (Safest - Start Here!)

See what would be extracted without changing any files:

```bash
npm run extract:preview
```

**Output:**
```
🚀 AUTO CODE EXTRACTOR 3000™
Mode: 🔍 DRY RUN
Found 62 files exceeding 150 lines
Filtered to 10 files for extraction

Files queued for extraction:
   1. [HIGH] frontends/nextjs/src/lib/db/database-admin/seed-default-data/css/categories/base.ts (278 lines)
   2. [HIGH] frontends/nextjs/src/lib/nerd-mode-ide/templates/configs/base.ts (267 lines)
   ...

✅ Successfully Extracted: 10 (dry run)
```

### 2. Extract 5 Files

Ready to try it for real? Extract just 5 files:

```bash
npm run extract:quick
```

This will:
- Extract 5 high-priority files
- Ask for confirmation (5 second countdown)
- Split functions into individual files
- Run linter to fix imports
- Run tests to verify everything works

### 3. Full Automation

Confident? Extract all high-priority files automatically:

```bash
npm run extract:auto
```

No prompts, full automation. Processes all high-priority files (typically 10-15 files).

### 4. Extract Everything

⚠️ **Advanced**: Process up to 50 files:

```bash
npm run extract:all
```

Use with caution! This is for when you're ready to process the entire backlog.

## Command Reference

| Command | What It Does | Safe? |
|---------|--------------|-------|
| `npm run extract:preview` | Preview changes only | ✅ 100% Safe |
| `npm run extract:quick` | Extract 5 files with confirmation | ⚠️ Needs review |
| `npm run extract:auto` | Extract all high-priority files | ⚠️ Automated |
| `npm run extract:all` | Extract up to 50 files | ⚠️ Advanced |
| `npm run extract:help` | Show detailed help | ✅ Safe |

## Options

Want more control? Use the full command:

```bash
# From root directory
cd frontends/nextjs
NODE_PATH=./node_modules npx tsx ../../tools/refactoring/auto-code-extractor-3000.ts [options]
```

**Available options:**
- `--dry-run` - Preview only
- `--priority=high|medium|low|all` - Filter by priority
- `--limit=N` - Process only N files
- `--batch-size=N` - Process N files at a time
- `--skip-lint` - Skip linting
- `--skip-test` - Skip testing
- `--auto-confirm` - No prompts
- `--verbose` - Detailed output

## Examples

### Conservative Approach (Recommended)

```bash
# Step 1: Preview
npm run extract:preview

# Step 2: Extract 3 files
cd frontends/nextjs
NODE_PATH=./node_modules npx tsx ../../tools/refactoring/auto-code-extractor-3000.ts --limit=3

# Step 3: Review changes
git diff

# Step 4: Test
npm test

# Step 5: Commit
git add .
git commit -m "refactor: extract 3 files to lambda-per-file structure"

# Step 6: Repeat
npm run extract:quick
```

### Aggressive Approach

```bash
# Extract all high-priority files at once
npm run extract:auto

# Review
git diff

# Test
npm test

# Commit
git add .
git commit -m "refactor: extract all high-priority files"
```

### Custom Workflow

```bash
cd frontends/nextjs

# Preview medium-priority files
NODE_PATH=./node_modules npx tsx ../../tools/refactoring/auto-code-extractor-3000.ts --dry-run --priority=medium

# Extract 5 medium-priority files, skip tests for speed
NODE_PATH=./node_modules npx tsx ../../tools/refactoring/auto-code-extractor-3000.ts --priority=medium --limit=5 --skip-test --auto-confirm

# Fix any lint issues
npm run lint:fix

# Run tests manually
npm test
```

## Troubleshooting

### "TypeError: Cannot find module 'typescript'"

**Solution**: Make sure you're running from the root directory or that frontends/nextjs dependencies are installed:

```bash
cd frontends/nextjs && npm install
```

### "No files to process"

**Solution**: All files have already been extracted or are skipped. Check the progress report:

```bash
cat docs/todo/LAMBDA_REFACTOR_PROGRESS.md
```

### Files are failing to extract

**Solution**: Check the detailed error in the results file:

```bash
cat docs/todo/AUTO_EXTRACT_RESULTS.json
```

Most failures are due to:
- Parse errors (tool needs to be improved)
- Files with complex patterns
- Files that need manual refactoring

### Import errors after extraction

**Solution**: Run the linter:

```bash
cd frontends/nextjs
npm run lint:fix
```

## What Gets Created?

Before:
```
lib/utils.ts (300 lines, 10 functions)
```

After:
```
lib/
├── utils.ts (re-exports everything)
└── utils/
    ├── functions/
    │   ├── function-one.ts
    │   ├── function-two.ts
    │   └── ... (one file per function)
    ├── UtilsUtils.ts (class wrapper)
    └── index.ts (barrel export)
```

## Next Steps

1. ✅ Run `npm run extract:preview` to see what files will be extracted
2. ✅ Run `npm run extract:quick` to extract 5 files
3. ✅ Review the generated code
4. ✅ Run tests: `cd frontends/nextjs && npm test`
5. ✅ Commit: `git add . && git commit -m "refactor: extract files"`
6. ✅ Repeat until all files are under 150 LOC

## Help & Support

- **Detailed Documentation**: See [AUTO_CODE_EXTRACTOR_3000.md](./AUTO_CODE_EXTRACTOR_3000.md)
- **Refactoring Guide**: See [tools/refactoring/README.md](./README.md)
- **Show Help**: `npm run extract:help`

## Safety

✅ **Completely safe to test** - Use `--dry-run` mode
✅ **Git history** - All original code is preserved
✅ **Rollback** - `git checkout path/to/file` to undo
✅ **Incremental** - Process files in small batches
✅ **Automatic testing** - Runs tests after extraction

---

**Ready to extract?** Start with `npm run extract:preview` !
