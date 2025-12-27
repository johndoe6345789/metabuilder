# Lambda-per-File Refactoring Tools

Automated tools for refactoring large TypeScript files into modular lambda-per-file structure.

## Quick Start

### 1. Generate Progress Report

```bash
npx tsx tools/refactoring/refactor-to-lambda.ts
```

This scans the codebase and generates `docs/todo/LAMBDA_REFACTOR_PROGRESS.md` with:
- List of all files exceeding 150 lines
- Categorization by type (library, component, DBAL, tool, etc.)
- Priority ranking
- Refactoring recommendations

### 2. Dry Run (Preview Changes)

Preview what would happen without modifying files:

```bash
# Preview all high-priority files
npx tsx tools/refactoring/orchestrate-refactor.ts --dry-run high

# Preview specific number of files
npx tsx tools/refactoring/orchestrate-refactor.ts --dry-run high --limit=5

# Preview a single file
npx tsx tools/refactoring/ast-lambda-refactor.ts --dry-run -v frontends/nextjs/src/lib/rendering/page/page-definition-builder.ts
```

### 3. Run Bulk Refactoring

Refactor files in bulk with automatic linting and import fixing:

```bash
# Refactor all high-priority files (recommended start)
npx tsx tools/refactoring/orchestrate-refactor.ts high

# Refactor first 10 high-priority files
npx tsx tools/refactoring/orchestrate-refactor.ts high --limit=10

# Refactor all pending files
npx tsx tools/refactoring/orchestrate-refactor.ts all
```

The orchestrator will:
1. ✅ Refactor files using AST analysis
2. 🔧 Run `npm run lint:fix` to fix imports
3. 🔍 Run type checking
4. 🧪 Run unit tests
5. 💾 Save detailed results

## Available Tools

### 1. `refactor-to-lambda.ts` - Progress Tracker

Scans codebase and generates tracking report.

```bash
npx tsx tools/refactoring/refactor-to-lambda.ts
```

**Output:** `docs/todo/LAMBDA_REFACTOR_PROGRESS.md`

### 2. `ast-lambda-refactor.ts` - AST-based Refactoring

Uses TypeScript compiler API for accurate code transformation.

```bash
# Single file
npx tsx tools/refactoring/ast-lambda-refactor.ts [options] <file>

# Options:
#   -d, --dry-run    Preview without writing
#   -v, --verbose    Detailed output
#   -h, --help       Show help
```

**Example:**
```bash
npx tsx tools/refactoring/ast-lambda-refactor.ts -v frontends/nextjs/src/lib/db/core/index.ts
```

### 3. `bulk-lambda-refactor.ts` - Regex-based Bulk Refactoring

Simpler regex-based refactoring (faster but less accurate).

```bash
npx tsx tools/refactoring/bulk-lambda-refactor.ts [options] <file>
```

### 4. `orchestrate-refactor.ts` - Master Orchestrator

Complete automated workflow for bulk refactoring.

```bash
npx tsx tools/refactoring/orchestrate-refactor.ts [priority] [options]

# Priority: high | medium | low | all
# Options:
#   -d, --dry-run     Preview only
#   --limit=N         Process only N files
#   --skip-lint       Skip linting phase
#   --skip-test       Skip testing phase
```

**Examples:**
```bash
# Dry run for high-priority files
npx tsx tools/refactoring/orchestrate-refactor.ts high --dry-run

# Refactor 5 high-priority files
npx tsx tools/refactoring/orchestrate-refactor.ts high --limit=5

# Refactor all medium-priority files, skip tests
npx tsx tools/refactoring/orchestrate-refactor.ts medium --skip-test
```

## Refactoring Pattern

The tools follow the pattern established in `frontends/nextjs/src/lib/schema/`:

### Before (Single Large File)
```
lib/
└── utils.ts (300 lines)
    ├── function validateEmail()
    ├── function parseDate()
    ├── function formatCurrency()
    └── ...
```

### After (Lambda-per-File)
```
lib/
├── utils.ts (re-exports)
└── utils/
    ├── functions/
    │   ├── validate-email.ts
    │   ├── parse-date.ts
    │   └── format-currency.ts
    ├── UtilsUtils.ts (class wrapper)
    └── index.ts (barrel export)
```

### Usage After Refactoring

```typescript
// Option 1: Import individual functions (recommended)
import { validateEmail } from '@/lib/utils'

// Option 2: Use class wrapper
import { UtilsUtils } from '@/lib/utils'
UtilsUtils.validateEmail(email)

// Option 3: Direct import from function file
import { validateEmail } from '@/lib/utils/functions/validate-email'
```

## File Categories

### High Priority (Easiest to Refactor)
- **Library files** - Pure utility functions
- **Tool files** - Development scripts

### Medium Priority
- **DBAL files** - Database abstraction layer
- **Component files** - React components (need sub-component extraction)

### Low Priority
- **Very large files** (>500 lines) - Need careful planning

### Skipped
- **Test files** - Comprehensive coverage is acceptable
- **Type definition files** - Naturally large

## Safety Features

1. **Dry Run Mode** - Preview all changes before applying
2. **Backup** - Original files are replaced with re-exports (old code preserved in git)
3. **Automatic Linting** - Fixes imports and formatting
4. **Type Checking** - Validates TypeScript compilation
5. **Test Running** - Ensures functionality preserved
6. **Incremental** - Process files in batches with limits

## Workflow Recommendation

### Phase 1: High-Priority Files (Library & Tools - 20 files)
```bash
# 1. Generate report
npx tsx tools/refactoring/refactor-to-lambda.ts

# 2. Dry run to preview
npx tsx tools/refactoring/orchestrate-refactor.ts high --dry-run

# 3. Refactor in small batches
npx tsx tools/refactoring/orchestrate-refactor.ts high --limit=5

# 4. Review, test, commit
git diff
npm run test:unit
git add . && git commit -m "refactor: convert 5 library files to lambda-per-file"

# 5. Repeat for next batch
npx tsx tools/refactoring/orchestrate-refactor.ts high --limit=5
```

### Phase 2: Medium-Priority Files (DBAL & Components - 68 files)
Similar process with medium priority.

### Phase 3: Low-Priority Files
Tackle individually with careful review.

## Troubleshooting

### Import Errors After Refactoring

```bash
# Re-run linter
npm run lint:fix

# Check type errors
npm run typecheck
```

### Tests Failing

1. Check if function signatures changed
2. Update test imports to new locations
3. Verify mocks are still valid

### Generated Code Issues

1. Review the generated files
2. Fix manually if needed
3. The tools provide a starting point, not perfect output

## Advanced Usage

### Custom Filtering

Edit `docs/todo/LAMBDA_REFACTOR_PROGRESS.md` to mark files as completed:

```markdown
- [x] `path/to/file.ts` (200 lines)  <!-- Marked complete -->
- [ ] `path/to/other.ts` (180 lines) <!-- Still pending -->
```

### Manual Refactoring

For complex files, use the generated code as a template and refine manually:

1. Run with `--dry-run` and `--verbose`
2. Review what would be generated
3. Apply manually with improvements

## Output Files

- `docs/todo/LAMBDA_REFACTOR_PROGRESS.md` - Tracking report with all files
- `docs/todo/REFACTOR_RESULTS.json` - Detailed results from last run
- Individual function files in `<module>/functions/` directories
- Class wrappers: `<Module>Utils.ts`
- Barrel exports: `<module>/index.ts`

## Next Steps After Refactoring

1. ✅ Review generated code
2. ✅ Run full test suite: `npm run test:unit`
3. ✅ Run E2E tests: `npm run test:e2e`
4. ✅ Update documentation if needed
5. ✅ Commit in logical batches
6. ✅ Update `LAMBDA_REFACTOR_PROGRESS.md` with completion status

## Contributing

To improve these tools:

1. Test on various file types
2. Report issues with specific files
3. Suggest improvements to AST parsing
4. Add support for more patterns (arrow functions, etc.)
