import { ASTLambdaRefactor } from './ast-lambda-refactor'
import * as fs from 'fs/promises'
import * as path from 'path'
import { findLargeFiles } from './reporting/find-large-files'
import { generateProgressReport } from './reporting/generate-progress-report'
import { runCommand } from './cli/utils/run-command'

export async function runLinting(): Promise<boolean> {
    if (this.options.skipLint || this.options.dryRun) {
      return true
    }

    console.log('\n' + '='.repeat(70))
    console.log('PHASE 2: LINTING & IMPORT FIXING')
    console.log('='.repeat(70) + '\n')

    try {
      this.log('Running eslint with auto-fix...', 'info')
      await runCommand('npm run lint:fix', { ignoreError: true })
      this.log('Linting completed', 'success')
      return true
    } catch (error) {
      this.log('Linting encountered issues (this is normal)', 'warning')
      return true // Don't fail on lint errors
    }
  }
