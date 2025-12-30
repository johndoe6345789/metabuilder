import { ASTLambdaRefactor } from './ast-lambda-refactor'
import * as fs from 'fs/promises'
import * as path from 'path'
import { findLargeFiles } from './reporting/find-large-files'
import { generateProgressReport } from './reporting/generate-progress-report'
import { runCommand } from './cli/utils/run-command'

export async function confirmExecution(files: FileToExtract[]): Promise<boolean> {
    if (this.options.autoConfirm || this.options.dryRun) {
      return true
    }

    console.log('\n' + '='.repeat(70))
    console.log('⚠️  CONFIRMATION REQUIRED')
    console.log('='.repeat(70))
    console.log(`\nThis will refactor ${files.length} files into modular structure.`)
    console.log('Files will be split into individual function files.')
    console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...\n')
    
    await new Promise(resolve => setTimeout(resolve, 5000))
    return true
  }
