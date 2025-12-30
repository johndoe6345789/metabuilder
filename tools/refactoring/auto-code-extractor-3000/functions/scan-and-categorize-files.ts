import { ASTLambdaRefactor } from './ast-lambda-refactor'
import * as fs from 'fs/promises'
import * as path from 'path'
import { findLargeFiles } from './reporting/find-large-files'
import { generateProgressReport } from './reporting/generate-progress-report'
import { runCommand } from './cli/utils/run-command'

export async function scanAndCategorizeFiles(): Promise<FileToExtract[]> {
    this.log('Scanning codebase for files exceeding 150 lines...', 'info')
    
    // Find git root directory (repo root)
    let rootDir = process.cwd()
    
    // If running from frontends/nextjs, go up to repo root
    if (rootDir.endsWith('/frontends/nextjs') || rootDir.endsWith('\\frontends\\nextjs')) {
      rootDir = path.join(rootDir, '..', '..')
    }
    
    const files = await findLargeFiles(rootDir, 150)
    
    const categorized = files.map(file => {
      // Convert numeric priority to string priority
      let priorityStr: 'high' | 'medium' | 'low'
      if (file.priority >= 8) {
        priorityStr = 'high'
      } else if (file.priority >= 4) {
        priorityStr = 'medium'
      } else {
        priorityStr = 'low'
      }
      
      return {
        path: file.path,
        lines: file.lines,
        priority: priorityStr,
        category: file.category,
        status: file.status === 'skipped' ? 'skipped' : 'pending',
      }
    }) as FileToExtract[]
    
    return categorized
  }
