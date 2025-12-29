import { ASTLambdaRefactor } from './ast-lambda-refactor'
import * as fs from 'fs/promises'
import * as path from 'path'
import { findLargeFiles } from './reporting/find-large-files'
import { generateProgressReport } from './reporting/generate-progress-report'
import { runCommand } from './cli/utils/run-command'

// CLI Interface
export function showHelp(): void {
  console.log(`
🚀 AUTO CODE EXTRACTOR 3000™ 🚀

The ultimate one-command solution for automatically extracting large files (>150 LOC)
into modular lambda-per-file structure.

USAGE:
  npx tsx tools/refactoring/auto-code-extractor-3000.ts [options]

OPTIONS:
  --dry-run           Preview changes without modifying files
  --priority=<level>  Filter by priority: high, medium, low, all (default: high)
  --limit=N           Process only N files (default: 10)
  --batch-size=N      Process N files at a time (default: 5)
  --skip-lint         Skip linting phase
  --skip-test         Skip testing phase
  --auto-confirm      Skip confirmation prompts
  --verbose           Show detailed output
  --help              Show this help message

EXAMPLES:
  # Preview what would be extracted (safe to run)
  npx tsx tools/refactoring/auto-code-extractor-3000.ts --dry-run

  # Extract 5 high-priority files with confirmation
  npx tsx tools/refactoring/auto-code-extractor-3000.ts --limit=5

  # Fully automated extraction of high-priority files
  npx tsx tools/refactoring/auto-code-extractor-3000.ts --auto-confirm

  # Process all files (use with caution!)
  npx tsx tools/refactoring/auto-code-extractor-3000.ts --priority=all --limit=50 --auto-confirm

  # Verbose dry run of medium priority files
  npx tsx tools/refactoring/auto-code-extractor-3000.ts --dry-run --priority=medium --verbose

WORKFLOW:
  1. 📋 Scans codebase for files >150 LOC
  2. 🎯 Filters by priority and limit
  3. 🔨 Extracts functions into individual files
  4. 🔧 Runs linter to fix imports
  5. 🧪 Runs tests to verify functionality
  6. 📊 Updates progress reports
  7. 💾 Saves detailed results

SAFETY FEATURES:
  - Dry run mode for safe preview
  - Batch processing for incremental work
  - Automatic backup via git history
  - Confirmation prompts for destructive operations
  - Detailed error reporting and recovery

For more information, see: tools/refactoring/README.md
`)
}
