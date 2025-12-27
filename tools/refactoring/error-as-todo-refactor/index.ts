import * as fs from 'fs/promises'
import * as path from 'path'

import { MultiLanguageLambdaRefactor } from '../multi-lang-refactor'
import { loadFilesFromReport } from './load-files'
import { detectPostRefactorIssues } from './post-refactor-checks'
import { generateTodoReport } from './reporting'
import { AddTodo, RefactorSession, TodoItem } from './types'

export interface ErrorAsTodoOptions {
  dryRun?: boolean
  verbose?: boolean
  limit?: number
  seedTodos?: TodoItem[]
}

const createLogger = (verbose: boolean) => (message: string) => {
  if (verbose) {
    console.log(message)
  }
}

const createTodoRecorder = (verbose: boolean, seedTodos: TodoItem[] = []) => {
  const todos: TodoItem[] = [...seedTodos]
  const addTodo: AddTodo = todo => {
    todos.push(todo)
    const emoji = {
      high: '🔴',
      medium: '🟡',
      low: '🟢',
      info: '💡'
    }[todo.severity]

    if (verbose) {
      console.log(`  ${emoji} TODO: ${todo.message}`)
    }
  }

  return { todos, addTodo }
}

const summarizeSession = (files: string[], todos: TodoItem[]): RefactorSession => ({
  timestamp: new Date().toISOString(),
  filesProcessed: files.length,
  successCount: todos.filter(t => t.category === 'success').length,
  todosGenerated: todos.filter(t => t.category !== 'success').length,
  todos
})

export const runErrorAsTodoRefactor = async (
  files: string[],
  options: ErrorAsTodoOptions = {}
): Promise<{ todos: TodoItem[]; session: RefactorSession }> => {
  const { dryRun = false, verbose = false, limit, seedTodos } = options
  const log = createLogger(verbose)
  const { todos, addTodo } = createTodoRecorder(verbose, seedTodos)
  const refactor = new MultiLanguageLambdaRefactor({ dryRun, verbose: false })
  const selectedFiles = typeof limit === 'number' ? files.slice(0, limit) : files

  console.log('🎯 Error-as-TODO Refactoring Runner')
  console.log('   Philosophy: Errors are good - they tell us what to fix!\n')
  console.log(`   Mode: ${dryRun ? '🔍 DRY RUN' : '⚡ LIVE'}`)
  console.log(`   Files: ${selectedFiles.length}\n`)

  for (let i = 0; i < selectedFiles.length; i++) {
    const file = selectedFiles[i]
    console.log(`\n[${i + 1}/${selectedFiles.length}] 📝 ${file}`)

    try {
      try {
        await fs.access(file)
      } catch {
        addTodo({
          file,
          category: 'parse_error',
          severity: 'low',
          message: 'File not found - may have been moved or deleted',
          suggestion: 'Update progress report or verify file location'
        })
        continue
      }

      const result = await refactor.refactorFile(file)

      if (result.success) {
        console.log('  ✅ Refactored successfully')
        addTodo({
          file,
          category: 'success',
          severity: 'info',
          message: `Successfully refactored into ${result.newFiles.length} files`,
          relatedFiles: result.newFiles
        })
      } else if (result.errors.some(error => error.includes('skipping'))) {
        console.log('  ⏭️  Skipped (not enough functions)')
        addTodo({
          file,
          category: 'manual_fix_needed',
          severity: 'low',
          message: 'File has < 3 functions - manual refactoring may not be needed',
          suggestion: 'Review file to see if refactoring would add value'
        })
      } else {
        console.log('  ⚠️  Encountered issues')
        for (const error of result.errors) {
          addTodo({
            file,
            category: 'parse_error',
            severity: 'medium',
            message: error,
            suggestion: 'May need manual intervention or tool improvement'
          })
        }
      }

      if (result.success && !dryRun) {
        await detectPostRefactorIssues(result.newFiles, addTodo, log)
      }
    } catch (error) {
      console.log('  ❌ Error occurred')
      addTodo({
        file,
        category: 'parse_error',
        severity: 'high',
        message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
        suggestion: 'Report this error for tool improvement'
      })
    }

    await new Promise(resolve => setTimeout(resolve, 50))
  }

  console.log('\n' + '='.repeat(60))
  console.log('📋 GENERATING TODO REPORT')
  console.log('='.repeat(60) + '\n')

  const report = generateTodoReport(todos)
  const todoPath = path.join(process.cwd(), 'docs/todo/REFACTOR_TODOS.md')
  await fs.writeFile(todoPath, report, 'utf-8')
  console.log(`✅ TODO report saved: ${todoPath}`)

  const session = summarizeSession(selectedFiles, todos)
  const jsonPath = path.join(process.cwd(), 'docs/todo/REFACTOR_TODOS.json')
  await fs.writeFile(jsonPath, JSON.stringify(session, null, 2), 'utf-8')
  console.log(`✅ JSON data saved: ${jsonPath}`)

  console.log('\n' + '='.repeat(60))
  console.log('📊 SESSION SUMMARY')
  console.log('='.repeat(60))
  console.log(`Files processed: ${selectedFiles.length}`)
  console.log(`✅ Successes: ${session.successCount}`)
  console.log(`📋 TODOs generated: ${session.todosGenerated}`)
  console.log(`  🔴 High: ${todos.filter(t => t.severity === 'high').length}`)
  console.log(`  🟡 Medium: ${todos.filter(t => t.severity === 'medium').length}`)
  console.log(`  🟢 Low: ${todos.filter(t => t.severity === 'low').length}`)

  console.log('\n💡 Remember: Errors are good! They tell us exactly what to fix.')

  return { todos, session }
}

export { detectPostRefactorIssues, generateTodoReport, loadFilesFromReport, runErrorAsTodoRefactor }
export type { AddTodo, RefactorSession, TodoItem }
