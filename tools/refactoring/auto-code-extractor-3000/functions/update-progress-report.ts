import { ASTLambdaRefactor } from './ast-lambda-refactor'
import * as fs from 'fs/promises'
import * as path from 'path'
import { findLargeFiles } from './reporting/find-large-files'
import { generateProgressReport } from './reporting/generate-progress-report'
import { runCommand } from './cli/utils/run-command'

export async function updateProgressReport(): Promise<void> {
    if (this.options.dryRun) {
      return
    }

    this.log('Updating progress report...', 'info')
    
    // Find git root directory
    let rootDir = process.cwd()
    if (rootDir.endsWith('/frontends/nextjs') || rootDir.endsWith('\\frontends\\nextjs')) {
      rootDir = path.join(rootDir, '..', '..')
    }
    
    const allFiles = await findLargeFiles(rootDir, 150)
    const report = await generateProgressReport(allFiles)
    
    const outputPath = path.join(rootDir, 'docs', 'todo', 'LAMBDA_REFACTOR_PROGRESS.md')
    await fs.writeFile(outputPath, report, 'utf-8')
    
    this.log('Progress report updated', 'success')
  }
