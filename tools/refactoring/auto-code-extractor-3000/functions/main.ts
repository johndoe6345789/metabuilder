import { ASTLambdaRefactor } from './ast-lambda-refactor'
import * as fs from 'fs/promises'
import * as path from 'path'
import { findLargeFiles } from './reporting/find-large-files'
import { generateProgressReport } from './reporting/generate-progress-report'
import { runCommand } from './cli/utils/run-command'

// Main execution
export async function main() {
  try {
    const options = parseArgs()
    const extractor = new AutoCodeExtractor3000(options)
    await extractor.run()
  } catch (error) {
    console.error('\n❌ Fatal Error:', error)
    process.exit(1)
  }
}
