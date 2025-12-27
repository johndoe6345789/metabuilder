#!/usr/bin/env tsx
/**
 * Error-as-TODO Refactoring Runner
 *
 * Runs refactoring and captures all errors/issues as actionable TODO items.
 * Philosophy: Errors are good - they tell us what needs to be fixed!
 */

import { buildSession, generateTodoReport, loadFilesFromReport, writeReports } from './error-as-todo/reporting'
import { parseArgs } from './error-as-todo/parse-args'
import { runRefactorSession } from './error-as-todo/runner'
import { Priority, TodoItem } from './error-as-todo/types'

function filterByPriority(files: string[], priority?: Priority) {
  if (priority && priority !== 'all') {
    console.log(`📌 Filtering for ${priority} priority files...`)
  }
  return files
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.showHelp) return

  const todos: TodoItem[] = []
  const addTodo = (todo: TodoItem) => todos.push(todo)

  console.log('📋 Loading files from progress report...')
  const files = filterByPriority(await loadFilesFromReport(addTodo), args.priority)

  if (files.length === 0) {
    console.log('❌ No files found. Run refactor-to-lambda.ts first.')
    process.exit(1)
  }

  console.log('\n' + '='.repeat(60))
  console.log('🚀 STARTING REFACTOR SESSION')
  console.log('='.repeat(60))

  const sessionTodos = await runRefactorSession({
    files,
    dryRun: args.dryRun,
    verbose: args.verbose,
    limit: args.limit,
    addTodo
  })

  const allTodos = [...todos, ...sessionTodos]
  const filesProcessed = args.limit ? Math.min(args.limit, files.length) : files.length

  console.log('\n' + '='.repeat(60))
  console.log('📋 GENERATING TODO REPORT')
  console.log('='.repeat(60) + '\n')

  const report = generateTodoReport(allTodos)
  const session = buildSession(filesProcessed, allTodos)
  await writeReports(session, report)

  console.log('\n✨ Done! Check REFACTOR_TODOS.md for your action items.')
}

if (require.main === module) {
  main().catch(console.error)
}
