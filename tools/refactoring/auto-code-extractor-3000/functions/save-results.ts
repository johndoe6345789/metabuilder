import { ASTLambdaRefactor } from './ast-lambda-refactor'
import * as fs from 'fs/promises'
import * as path from 'path'
import { findLargeFiles } from './reporting/find-large-files'
import { generateProgressReport } from './reporting/generate-progress-report'
import { runCommand } from './cli/utils/run-command'

export async function saveResults(): Promise<void> {
    // Find git root directory
    let rootDir = process.cwd()
    if (rootDir.endsWith('/frontends/nextjs') || rootDir.endsWith('\\frontends\\nextjs')) {
      rootDir = path.join(rootDir, '..', '..')
    }
    
    const timestamp = new Date().toISOString()
    const duration = (Date.now() - this.startTime) / 1000
    
    const results = {
      timestamp,
      duration: `${duration.toFixed(2)}s`,
      options: this.options,
      summary: {
        total: this.results.length,
        completed: this.results.filter(f => f.status === 'completed').length,
        failed: this.results.filter(f => f.status === 'failed').length,
        skipped: this.results.filter(f => f.status === 'skipped').length,
      },
      files: this.results,
    }
    
    const outputPath = path.join(rootDir, 'docs', 'todo', 'AUTO_EXTRACT_RESULTS.json')
    await fs.writeFile(outputPath, JSON.stringify(results, null, 2), 'utf-8')
    
    this.log(`Results saved to ${outputPath}`, 'success')
  }
