#!/usr/bin/env tsx
import * as fs from 'fs/promises'
import * as path from 'path'
import { MultiLanguageLambdaRefactor } from '../../multi-lang-refactor'
import { buildTodoReport } from './generate-todo-report'
import { loadFilesFromProgressReport } from './load-files-from-report'
import { processFileWithTodos } from './process-file-with-todos'
import { RefactorSession, TodoItem } from './types'

export const runErrorAsTodo = async (args: string[]): Promise<void> => {
  const dryRun = args.includes('--dry-run') || args.includes('-d')
  const verbose = args.includes('--verbose') || args.includes('-v')
  const limitArg = args.find(a => a.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined

  const todos: TodoItem[] = []
  const pushTodo = (todo: TodoItem) => {
    todos.push(todo)
    if (verbose) {
      const emoji = { high: '🔴', medium: '🟡', low: '🟢', info: '💡' }[todo.severity]
      console.log(`  ${emoji} TODO: ${todo.message}`)
    }
  }

  const context = {
    dryRun,
    verbose,
    refactor: new MultiLanguageLambdaRefactor({ dryRun, verbose: false }),
    pushTodo
  }

  console.log('🎯 Error-as-TODO Refactoring Runner')
  console.log(`   Mode: ${dryRun ? '🔍 DRY RUN' : '⚡ LIVE'}`)

  console.log('\n📋 Loading files from progress report...')
  let files = await loadFilesFromProgressReport(pushTodo)
  if (limit) files = files.slice(0, limit)

  if (files.length === 0) {
    console.log('❌ No files found. Run refactor-to-lambda.ts first.')
    return
  }

  for (let i = 0; i < files.length; i++) {
    await processFileWithTodos(context, files[i], i + 1, files.length)
  }

  console.log('\n' + '='.repeat(60))
  console.log('📋 GENERATING TODO REPORT')
  console.log('='.repeat(60) + '\n')

  const { session, markdown } = buildTodoReport(todos)
  const todoPath = path.join(process.cwd(), 'docs/todo/REFACTOR_TODOS.md')
  await fs.writeFile(todoPath, markdown, 'utf-8')
  console.log(`✅ TODO report saved: ${todoPath}`)

  const jsonPath = path.join(process.cwd(), 'docs/todo/REFACTOR_TODOS.json')
  await fs.writeFile(jsonPath, JSON.stringify(session, null, 2), 'utf-8')
  console.log(`✅ JSON data saved: ${jsonPath}`)

  logSummary(session)
}

const logSummary = (session: RefactorSession) => {
  console.log('\n' + '='.repeat(60))
  console.log('📊 SESSION SUMMARY')
  console.log('='.repeat(60))
  console.log(`Files processed: ${session.filesProcessed}`)
  console.log(`✅ Successes: ${session.successCount}`)
  console.log(`📋 TODOs generated: ${session.todosGenerated}`)
  console.log(`  🔴 High: ${session.todos.filter(t => t.severity === 'high').length}`)
  console.log(`  🟡 Medium: ${session.todos.filter(t => t.severity === 'medium').length}`)
  console.log(`  🟢 Low: ${session.todos.filter(t => t.severity === 'low').length}`)

  console.log('\n💡 Remember: Errors are good! They tell us exactly what to fix.')
}

if (require.main === module) {
  const args = process.argv.slice(2)
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Error-as-TODO Refactoring Runner\n')
    console.log('Treats all errors as actionable TODO items!\n')
    console.log('Usage: tsx error-as-todo-refactor.ts [options] [priority]\n')
    console.log('Options:')
    console.log('  -d, --dry-run      Preview without writing')
    console.log('  -v, --verbose      Show detailed output')
    console.log('  --limit=N          Process only N files')
    console.log('  -h, --help         Show help\n')
    process.exit(0)
  }

  runErrorAsTodo(args).catch(console.error)
}
