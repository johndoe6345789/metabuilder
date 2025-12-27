#!/usr/bin/env ts-node
/**
 * Refactor large TypeScript files into lambda-per-file structure
 * 
 * This tool helps identify files exceeding 150 lines and tracks refactoring progress.
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import { findLargeFiles } from '../reporting/find-large-files'
import { generateProgressReport } from '../reporting/generate-progress-report'

async function main() {
  const rootDir = process.cwd()
  console.log('Scanning for TypeScript files exceeding 150 lines...')
  
  const files = await findLargeFiles(rootDir, 150)
  console.log(`Found ${files.length} files`)
  
  const report = await generateProgressReport(files)
  
  const outputPath = path.join(rootDir, 'docs', 'todo', 'LAMBDA_REFACTOR_PROGRESS.md')
  await fs.writeFile(outputPath, report, 'utf-8')
  
  console.log(`Report generated: ${outputPath}`)
  console.log(`\nSummary:`)
  console.log(`- Total files: ${files.length}`)
  console.log(`- Pending refactor: ${files.filter(f => f.status === 'pending').length}`)
  console.log(`- Skipped: ${files.filter(f => f.status === 'skipped').length}`)
}

if (require.main === module) {
  main().catch(console.error)
}

export { findLargeFiles, generateProgressReport as generateReport }
