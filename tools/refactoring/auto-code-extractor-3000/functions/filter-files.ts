import { ASTLambdaRefactor } from './ast-lambda-refactor'
import * as fs from 'fs/promises'
import * as path from 'path'
import { findLargeFiles } from './reporting/find-large-files'
import { generateProgressReport } from './reporting/generate-progress-report'
import { runCommand } from './cli/utils/run-command'

export function filterFiles(files: FileToExtract[]): FileToExtract[] {
    let filtered = files.filter(f => f.status === 'pending')
    
    if (this.options.priority !== 'all') {
      filtered = filtered.filter(f => f.priority === this.options.priority)
    }
    
    return filtered.slice(0, this.options.limit)
  }
