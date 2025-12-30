import * as fs from 'fs/promises'

import { AddTodo } from './types'

export const detectPostRefactorIssues = async (
  newFiles: string[],
  addTodo: AddTodo,
  log: (message: string) => void
): Promise<void> => {
  log('  🔍 Checking for common issues...')

  for (const file of newFiles) {
    if (!file.endsWith('.ts')) continue

    try {
      const content = await fs.readFile(file, 'utf-8')

      if (content.includes('this.')) {
        addTodo({
          file,
          category: 'manual_fix_needed',
          severity: 'high',
          message: 'Contains "this" reference - needs manual conversion from class method to function',
          location: file,
          suggestion: 'Replace "this.methodName" with direct function calls or pass data as parameters'
        })
      }

      if (content.includes('import') && content.split('import').length > 10) {
        addTodo({
          file,
          category: 'import_error',
          severity: 'low',
          message: 'Many imports detected - may need optimization',
          suggestion: 'Review imports and remove unused ones'
        })
      }

      const lines = content.split('\n').length
      if (lines > 100) {
        addTodo({
          file,
          category: 'manual_fix_needed',
          severity: 'medium',
          message: `Extracted function is still ${lines} lines - may need further breakdown`,
          suggestion: 'Consider breaking into smaller functions'
        })
      }
    } catch {
      // File read errors are captured elsewhere in the flow
    }
  }
}
