import { ASTLambdaRefactor } from './ast-lambda-refactor'
import * as fs from 'fs/promises'
import * as path from 'path'
import { findLargeFiles } from './reporting/find-large-files'
import { generateProgressReport } from './reporting/generate-progress-report'
import { runCommand } from './cli/utils/run-command'

export function parseArgs(): Partial<ExtractionOptions> {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp()
    process.exit(0)
  }

  const options: Partial<ExtractionOptions> = {}

  // Boolean flags
  options.dryRun = args.includes('--dry-run') || args.includes('-d')
  options.skipLint = args.includes('--skip-lint')
  options.skipTest = args.includes('--skip-test')
  options.autoConfirm = args.includes('--auto-confirm')
  options.verbose = args.includes('--verbose') || args.includes('-v')

  // Priority
  const priorityArg = args.find(a => a.startsWith('--priority='))
  if (priorityArg) {
    const priority = priorityArg.split('=')[1] as 'high' | 'medium' | 'low' | 'all'
    if (['high', 'medium', 'low', 'all'].includes(priority)) {
      options.priority = priority
    }
  }

  // Limit
  const limitArg = args.find(a => a.startsWith('--limit='))
  if (limitArg) {
    options.limit = parseInt(limitArg.split('=')[1], 10)
  }

  // Batch size
  const batchArg = args.find(a => a.startsWith('--batch-size='))
  if (batchArg) {
    options.batchSize = parseInt(batchArg.split('=')[1], 10)
  }

  return options
}
