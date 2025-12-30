#!/usr/bin/env tsx

import { loadFilesFromReport, runErrorAsTodoRefactor } from './error-as-todo-refactor/index'
import type { TodoItem } from './error-as-todo-refactor/index'

const printHelp = () => {
  console.log('Error-as-TODO Refactoring Runner\n')
  console.log('Treats all errors as actionable TODO items!\n')
  console.log('Usage: tsx error-as-todo-refactor.ts [options] [priority]\n')
  console.log('Options:')
  console.log('  -d, --dry-run      Preview without writing')
  console.log('  -v, --verbose      Show detailed output')
  console.log('  --limit=N          Process only N files')
  console.log('  high|medium|low    Filter by priority')
  console.log('  -h, --help         Show help\n')
  console.log('Examples:')
  console.log('  tsx error-as-todo-refactor.ts high --limit=5')
  console.log('  tsx error-as-todo-refactor.ts --dry-run medium')
}

const main = async () => {
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    printHelp()
    process.exit(0)
  }

  const dryRun = args.includes('--dry-run') || args.includes('-d')
  const verbose = args.includes('--verbose') || args.includes('-v')
  const limitArg = args.find(arg => arg.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined
  const priority = args.find(arg => ['high', 'medium', 'low', 'all'].includes(arg))

  console.log('📋 Loading files from progress report...')
  const seedTodos: TodoItem[] = []
  const files = await loadFilesFromReport(todo => seedTodos.push(todo))

  if (files.length === 0) {
    console.log('❌ No files found. Run refactor-to-lambda.ts first.')
    process.exit(1)
  }

  if (priority && priority !== 'all') {
    console.log(`📌 Filtering for ${priority} priority files...`)
  }

  await runErrorAsTodoRefactor(files, { dryRun, verbose, limit, seedTodos })

  console.log('\n✨ Done! Check REFACTOR_TODOS.md for your action items.')
}

if (require.main === module) {
  main().catch(console.error)
}
