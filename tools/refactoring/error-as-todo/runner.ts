import * as fs from 'fs/promises'
import { MultiLanguageLambdaRefactor } from '../multi-lang-refactor'
import { RunnerOptions, TodoItem } from './types'

type TodoLogger = (todo: TodoItem) => void
interface RunnerContext extends RunnerOptions { addTodo: TodoLogger }
const createLogger = (verbose: boolean) => (message: string) => verbose && console.log(message)

async function detectPostRefactorIssues(files: string[], addTodo: TodoLogger, logVerbose: (message: string) => void) {
  logVerbose('  🔍 Checking for common issues...')
  for (const file of files) {
    if (!file.endsWith('.ts')) continue
    try {
      const content = await fs.readFile(file, 'utf-8')
      const checks: Array<[boolean, TodoItem]> = [
        [
          content.includes('this.'),
          {
            file,
            category: 'manual_fix_needed',
            severity: 'high',
            message: 'Contains "this" reference - needs manual conversion from class method to function',
            location: file,
            suggestion: 'Replace "this.methodName" with direct function calls or pass data as parameters'
          }
        ],
        [
          content.includes('import') && content.split('import').length > 10,
          {
            file,
            category: 'import_error',
            severity: 'low',
            message: 'Many imports detected - may need optimization',
            suggestion: 'Review imports and remove unused ones'
          }
        ],
        [
          content.split('\n').length > 100,
          {
            file,
            category: 'manual_fix_needed',
            severity: 'medium',
            message: 'Extracted function is still large - may need further breakdown',
            suggestion: 'Consider breaking into smaller functions'
          }
        ]
      ]
      checks.filter(([condition]) => condition).forEach(([, todo]) => addTodo(todo))
    } catch (error) {
      addTodo({
        file,
        category: 'parse_error',
        severity: 'medium',
        message: `Unexpected issue reading file: ${error instanceof Error ? error.message : String(error)}`,
        suggestion: 'Verify generated file is accessible'
      })
    }
  }
}

async function refactorWithTodoCapture(context: RunnerContext, addTodo: TodoLogger) {
  const { files, dryRun, limit, verbose } = context
  const logVerbose = createLogger(verbose)
  const targetFiles = limit ? files.slice(0, limit) : files
  const refactor = new MultiLanguageLambdaRefactor({ dryRun, verbose: false })
  console.log('🎯 Error-as-TODO Refactoring Runner')
  console.log('   Philosophy: Errors are good - they tell us what to fix!\n')
  console.log(`   Mode: ${dryRun ? '🔍 DRY RUN' : '⚡ LIVE'}`)
  console.log(`   Files: ${targetFiles.length}\n`)

  for (let i = 0; i < targetFiles.length; i++) {
    const file = targetFiles[i]
    console.log(`\n[${i + 1}/${targetFiles.length}] 📝 ${file}`)
    try {
      try {
        await fs.access(file)
      } catch {
        addTodo({ file, category: 'parse_error', severity: 'low', message: 'File not found - may have been moved or deleted', suggestion: 'Update progress report or verify file location' })
        continue
      }

      const result = await refactor.refactorFile(file)
      if (result.success) {
        console.log('  ✅ Refactored successfully')
        addTodo({ file, category: 'success', severity: 'info', message: `Successfully refactored into ${result.newFiles.length} files`, relatedFiles: result.newFiles })
      } else if (result.errors.some(e => e.includes('skipping'))) {
        console.log('  ⏭️  Skipped (not enough functions)')
        addTodo({ file, category: 'manual_fix_needed', severity: 'low', message: 'File has < 3 functions - manual refactoring may not be needed', suggestion: 'Review file to see if refactoring would add value' })
      } else {
        console.log('  ⚠️  Encountered issues')
        result.errors.forEach(error =>
          addTodo({ file, category: 'parse_error', severity: 'medium', message: error, suggestion: 'May need manual intervention or tool improvement' })
        )
      }

      if (result.success && !dryRun) await detectPostRefactorIssues(result.newFiles, addTodo, logVerbose)
    } catch (error) {
      console.log('  ❌ Error occurred')
      addTodo({ file, category: 'parse_error', severity: 'high', message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`, suggestion: 'Report this error for tool improvement' })
    }
    await new Promise(resolve => setTimeout(resolve, 50))
  }
}

export async function runRefactorSession(context: RunnerContext): Promise<TodoItem[]> {
  const todos: TodoItem[] = []
  const forwardTodo: TodoLogger = todo => {
    todos.push(todo)
    context.addTodo(todo)
  }
  await refactorWithTodoCapture({ ...context, addTodo: forwardTodo }, forwardTodo)

  console.log('\n' + '='.repeat(60))
  console.log('📊 SESSION SUMMARY')
  console.log('='.repeat(60))
  const filesProcessed = context.limit ? Math.min(context.limit, context.files.length) : context.files.length
  const countBy = (predicate: (todo: TodoItem) => boolean) => todos.filter(predicate).length
  console.log(`Files processed: ${filesProcessed}`)
  console.log(`✅ Successes: ${countBy(t => t.category === 'success')}`)
  console.log(`📋 TODOs generated: ${countBy(t => t.category !== 'success')}`)
  console.log(`  🔴 High: ${countBy(t => t.severity === 'high')}`)
  console.log(`  🟡 Medium: ${countBy(t => t.severity === 'medium')}`)
  console.log(`  🟢 Low: ${countBy(t => t.severity === 'low')}`)
  console.log('\n💡 Remember: Errors are good! They tell us exactly what to fix.')
  return todos
}
