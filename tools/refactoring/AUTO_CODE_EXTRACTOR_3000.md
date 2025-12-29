# 🚀 AUTO CODE EXTRACTOR 3000™

**The ultimate one-command solution for automated code extraction!**

Stop manually refactoring large files. Let the Auto Code Extractor 3000™ automatically split your 150+ LOC files into clean, modular, lambda-per-file structure with a single command.

## ✨ Features

- 🤖 **Fully Automated** - One command does everything
- 🔍 **Smart Scanning** - Automatically finds files exceeding 150 lines
- 🎯 **Priority-Based** - Processes files by difficulty (high/medium/low)
- 📦 **Batch Processing** - Extract multiple files in controlled batches
- 🛡️ **Safety First** - Dry-run mode, confirmation prompts, git history backup
- 🔧 **Auto-Fix** - Runs linter and fixes imports automatically
- 🧪 **Test Integration** - Runs tests to verify functionality
- 📊 **Progress Tracking** - Detailed reports and JSON results
- ⚡ **Fast** - AST-based extraction for accuracy and speed

## 🚀 Quick Start

### Preview What Would Be Extracted (Safe!)

```bash
npm run extract:preview
```

This is completely safe - it shows you what would happen without changing any files.

### Extract 5 Files (Recommended First Try)

```bash
npm run extract:quick
```

Extracts 5 high-priority files with confirmation prompt.

### Fully Automated Extraction

```bash
npm run extract:auto
```

Automatically extracts all high-priority files without prompts.

### Extract Everything (Advanced)

```bash
npm run extract:all
```

⚠️ Warning: This processes up to 50 files automatically. Use with caution!

## 📖 Usage

### Basic Command

```bash
npx tsx tools/refactoring/auto-code-extractor-3000.ts [options]
```

### Available Options

| Option | Description | Default |
|--------|-------------|---------|
| `--dry-run` | Preview changes without modifying files | `false` |
| `--priority=<level>` | Filter by priority: `high`, `medium`, `low`, `all` | `high` |
| `--limit=N` | Process only N files | `10` |
| `--batch-size=N` | Process N files at a time | `5` |
| `--skip-lint` | Skip linting phase | `false` |
| `--skip-test` | Skip testing phase | `false` |
| `--auto-confirm` | Skip confirmation prompts | `false` |
| `--verbose` | Show detailed output | `false` |
| `--help` | Show help message | - |

### Examples

#### Safe Exploration

```bash
# Preview all high-priority files
npx tsx tools/refactoring/auto-code-extractor-3000.ts --dry-run

# Preview with verbose output
npx tsx tools/refactoring/auto-code-extractor-3000.ts --dry-run --verbose

# Preview medium-priority files
npx tsx tools/refactoring/auto-code-extractor-3000.ts --dry-run --priority=medium
```

#### Controlled Extraction

```bash
# Extract just 3 files (with confirmation)
npx tsx tools/refactoring/auto-code-extractor-3000.ts --limit=3

# Extract 10 files in batches of 2
npx tsx tools/refactoring/auto-code-extractor-3000.ts --limit=10 --batch-size=2

# Extract medium-priority files
npx tsx tools/refactoring/auto-code-extractor-3000.ts --priority=medium --limit=5
```

#### Automated Workflows

```bash
# Fully automated extraction of high-priority files
npx tsx tools/refactoring/auto-code-extractor-3000.ts --auto-confirm

# Extract all files (up to limit), skip tests for speed
npx tsx tools/refactoring/auto-code-extractor-3000.ts --priority=all --limit=30 --auto-confirm --skip-test

# Verbose automated extraction
npx tsx tools/refactoring/auto-code-extractor-3000.ts --auto-confirm --verbose
```

## 🔄 Workflow

The Auto Code Extractor 3000™ follows a comprehensive workflow:

```
1. 📋 SCANNING
   └─ Scans codebase for files >150 LOC
   └─ Categorizes by type (component, library, tool, etc.)
   └─ Assigns priority levels

2. 🎯 FILTERING
   └─ Filters by priority level
   └─ Applies file limit
   └─ Excludes skipped files (tests, types)

3. 🔍 PREVIEW & CONFIRMATION
   └─ Shows files to be processed
   └─ Requests confirmation (unless --auto-confirm)

4. 🔨 EXTRACTION (Batch Processing)
   └─ Uses AST analysis for accurate code transformation
   └─ Extracts functions to individual files
   └─ Creates class wrappers for backward compatibility
   └─ Generates barrel exports (index.ts)
   └─ Replaces original file with re-exports

5. 🔧 LINTING
   └─ Runs eslint with auto-fix
   └─ Fixes imports and formatting

6. 🧪 TESTING
   └─ Runs unit tests
   └─ Verifies functionality preserved

7. 📊 REPORTING
   └─ Updates progress report
   └─ Saves detailed JSON results
   └─ Prints summary

8. ✅ COMPLETE
   └─ All done! Review and commit
```

## 📁 Output Structure

### Before Extraction

```
lib/
└── utils.ts (300 lines, 10 functions)
```

### After Extraction

```
lib/
├── utils.ts (re-exports everything)
└── utils/
    ├── functions/
    │   ├── validate-email.ts
    │   ├── parse-date.ts
    │   ├── format-currency.ts
    │   ├── calculate-total.ts
    │   └── ... (one file per function)
    ├── UtilsUtils.ts (class wrapper)
    └── index.ts (barrel export)
```

### Usage After Extraction

```typescript
// Option 1: Import individual functions (recommended)
import { validateEmail, parseDate } from '@/lib/utils'

// Option 2: Use class wrapper (for those who prefer classes)
import { UtilsUtils } from '@/lib/utils'
UtilsUtils.validateEmail(email)

// Option 3: Direct import from function file
import { validateEmail } from '@/lib/utils/functions/validate-email'
```

## 🎯 Priority Levels

### High Priority (Easiest)
- **Library files** - Pure utility functions, no dependencies
- **Tool files** - Development scripts
- ✅ **Recommended to start here**

### Medium Priority
- **DBAL files** - Database abstraction layer
- **Component files** - React components (may need sub-component extraction)

### Low Priority (Complex)
- **Very large files** (>500 lines)
- **Complex interdependencies**
- ⚠️ May need manual review

### Skipped
- **Test files** - Comprehensive coverage is acceptable
- **Type definition files** - Naturally large

## 📊 Reports & Results

### Progress Report
`docs/todo/LAMBDA_REFACTOR_PROGRESS.md`

Markdown report showing:
- All files exceeding 150 lines
- Categorization and priority
- Completion status
- Refactoring recommendations

### Extraction Results
`docs/todo/AUTO_EXTRACT_RESULTS.json`

JSON file containing:
- Timestamp and duration
- Options used
- Summary statistics
- Per-file results with errors

## 🛡️ Safety Features

### 1. Dry-Run Mode
Preview all changes without modifying files:
```bash
npm run extract:preview
```

### 2. Confirmation Prompts
Unless `--auto-confirm` is used, you'll get a 5-second warning before any changes.

### 3. Batch Processing
Process files in small batches to catch issues early:
```bash
npx tsx tools/refactoring/auto-code-extractor-3000.ts --batch-size=2
```

### 4. Git History
All original code is preserved in git history. You can always revert:
```bash
git checkout path/to/file.ts
```

### 5. Automatic Testing
Unless skipped, tests run after extraction to verify functionality.

### 6. Detailed Error Reporting
Any failures are logged with full error messages for troubleshooting.

## 🔧 Troubleshooting

### Import Errors After Extraction

```bash
# Re-run linter
npm run lint:fix
```

### Type Errors

```bash
# Check type errors
npm run typecheck

# Or if using tsx
npx tsc --noEmit
```

### Tests Failing

1. Check if function signatures changed
2. Update test imports to new locations
3. Verify mocks are still valid

### Rollback Changes

```bash
# Revert specific file
git checkout path/to/file.ts

# Revert all changes
git reset --hard HEAD
```

### Tool Not Working

```bash
# Check Node.js version (requires 18+)
node --version

# Install tsx if missing
npm install -g tsx

# Run with verbose output for debugging
npx tsx tools/refactoring/auto-code-extractor-3000.ts --dry-run --verbose
```

## 📝 Recommended Workflow

### Phase 1: Test Drive (2 minutes)
```bash
# 1. Preview what would happen
npm run extract:preview

# 2. Try on 3 files
npx tsx tools/refactoring/auto-code-extractor-3000.ts --limit=3

# 3. Review the output
git diff

# 4. If happy, commit
git add . && git commit -m "refactor: extract 3 files to lambda-per-file structure"
```

### Phase 2: High-Priority Batch (10 minutes)
```bash
# Extract all high-priority files (library & tools)
npm run extract:auto

# Review and test
git diff
npm test

# Commit
git add . && git commit -m "refactor: extract high-priority files"
```

### Phase 3: Medium-Priority (30 minutes)
```bash
# Extract medium-priority files in batches
npx tsx tools/refactoring/auto-code-extractor-3000.ts --priority=medium --limit=10 --auto-confirm

# Review, test, commit
git diff
npm test
git add . && git commit -m "refactor: extract medium-priority files"
```

### Phase 4: Polish (variable)
```bash
# Review any failed extractions
cat docs/todo/AUTO_EXTRACT_RESULTS.json

# Manually handle complex cases
# Update tests if needed
# Final commit
```

## 🎓 Best Practices

### DO ✅
- Start with `--dry-run` to preview
- Begin with high-priority files
- Process in small batches (5-10 files)
- Review changes before committing
- Run tests after extraction
- Commit frequently

### DON'T ❌
- Don't skip the dry-run on first use
- Don't extract everything at once
- Don't commit without reviewing
- Don't skip tests (unless you have a reason)
- Don't panic if something fails - it's recoverable

## 🔗 Related Tools

- **`refactor-to-lambda.ts`** - Generate progress report only
- **`ast-lambda-refactor.ts`** - Extract a single file manually
- **`orchestrate-refactor.ts`** - Manual batch processing (legacy)

## 💡 Tips & Tricks

### Process Specific Files

```bash
# First, mark files in docs/todo/LAMBDA_REFACTOR_PROGRESS.md
# Then run with limit
npm run extract:quick
```

### Skip Slow Steps

```bash
# Skip tests for faster iteration during development
npx tsx tools/refactoring/auto-code-extractor-3000.ts --skip-test

# Skip both lint and tests for maximum speed (not recommended)
npx tsx tools/refactoring/auto-code-extractor-3000.ts --skip-lint --skip-test
```

### Verbose Debugging

```bash
# See exactly what's happening
npx tsx tools/refactoring/auto-code-extractor-3000.ts --dry-run --verbose
```

### Custom Workflow

```bash
# Extract only library files
npx tsx tools/refactoring/auto-code-extractor-3000.ts --priority=high --limit=20 --auto-confirm

# Then extract components separately
npx tsx tools/refactoring/auto-code-extractor-3000.ts --priority=medium --limit=10
```

## 📊 Statistics

Based on the current codebase:

- **Total files >150 LOC:** ~60 files
- **High Priority:** 14 files (library & tools)
- **Medium Priority:** 35 files (components & DBAL)
- **Low Priority:** 2 files (complex hooks)
- **Skipped:** 9 files (tests)

**Estimated Time:**
- High Priority: 5-10 minutes
- Medium Priority: 20-30 minutes
- Total: ~30-40 minutes for complete extraction

## 🤝 Contributing

Found a bug or have a suggestion? 

1. Check existing issues
2. Create detailed bug report with file that failed
3. Include error message and stack trace
4. Suggest improvements to AST parsing

## 📜 License

Same as the main MetaBuilder project.

---

**🎉 Happy Extracting!**

Made with ❤️ by the MetaBuilder team
