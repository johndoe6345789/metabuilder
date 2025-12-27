import * as fs from 'fs/promises'
import { ErrorAsTodoContext } from './types'

const detectPostRefactorIssues = async (
  context: ErrorAsTodoContext,
  originalFile: string,
  newFiles: string[]
): Promise<void> => {
  for (const file of newFiles) {
    if (!file.endsWith('.ts')) continue

    try {
      const content = await fs.readFile(file, 'utf-8')

      if (content.includes('this.')) {
        context.pushTodo({
          file,
          category: 'manual_fix_needed',
          severity: 'high',
          message: 'Contains "this" reference - needs manual conversion from class method to function',
          location: file,
          suggestion: 'Replace "this.methodName" with direct function calls or pass data as parameters'
        })
      }

      const lines = content.split('\n').length
      if (lines > 100) {
        context.pushTodo({
          file,
          category: 'manual_fix_needed',
          severity: 'medium',
          message: `Extracted function is still ${lines} lines - may need further breakdown`,
          suggestion: 'Consider breaking into smaller functions'
        })
      }

      if (content.includes('import') && content.split('import').length > 10) {
        context.pushTodo({
          file,
          category: 'import_error',
          severity: 'low',
          message: 'Many imports detected - may need optimization',
          suggestion: 'Review imports and remove unused ones'
        })
      }
    } catch {
      // ignore read errors in post-processing
    }
  }
}

export const processFileWithTodos = async (
  context: ErrorAsTodoContext,
  file: string,
  index: number,
  total: number
): Promise<void> => {
  console.log(`\n[${index}/${total}] 📝 ${file}`)

  try {
    try {
      await fs.access(file)
    } catch {
      context.pushTodo({
        file,
        category: 'parse_error',
        severity: 'low',
        message: 'File not found - may have been moved or deleted',
        suggestion: 'Update progress report or verify file location'
      })
      return
    }

    const result = await context.refactor.refactorFile(file)

    if (result.success) {
      console.log('  ✅ Refactored successfully')
      context.pushTodo({
        file,
        category: 'success',
        severity: 'info',
        message: `Successfully refactored into ${result.newFiles.length} files`,
        relatedFiles: result.newFiles
      })
    } else if (result.errors.some(error => error.includes('skipping'))) {
      console.log('  ⏭️  Skipped (not enough functions)')
      context.pushTodo({
        file,
        category: 'manual_fix_needed',
        severity: 'low',
        message: 'File has < 3 functions - manual refactoring may not be needed',
        suggestion: 'Review file to see if refactoring would add value'
      })
    } else {
      console.log('  ⚠️  Encountered issues')
      for (const error of result.errors) {
        context.pushTodo({
          file,
          category: 'parse_error',
          severity: 'medium',
          message: error,
          suggestion: 'May need manual intervention or tool improvement'
        })
      }
    }

    if (result.success && !context.dryRun) {
      await detectPostRefactorIssues(context, file, result.newFiles)
    }
  } catch (error) {
    console.log('  ❌ Error occurred')
    context.pushTodo({
      file,
      category: 'parse_error',
      severity: 'high',
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      suggestion: 'Report this error for tool improvement'
    })
  }

  await new Promise(resolve => setTimeout(resolve, 50))
}
