import { ASTLambdaRefactor } from './ast-lambda-refactor'
import * as fs from 'fs/promises'
import * as path from 'path'
import { findLargeFiles } from './reporting/find-large-files'
import { generateProgressReport } from './reporting/generate-progress-report'
import { runCommand } from './cli/utils/run-command'

export function log(message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const icons = {
      info: '📋',
      success: '✅',
      warning: '⚠️',
      error: '❌',
    }
    console.log(`${icons[level]} ${message}`)
  }
