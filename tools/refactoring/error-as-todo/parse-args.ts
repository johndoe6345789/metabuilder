import { Priority } from './types'

export interface ParsedArgs {
  dryRun: boolean
  verbose: boolean
  limit?: number
  priority?: Priority
  showHelp: boolean
}

function printHelp() {
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

export function parseArgs(rawArgs: string[]): ParsedArgs {
  const args = rawArgs.slice()
  const showHelp = args.includes('--help') || args.includes('-h')

  if (showHelp) {
    printHelp()
    return { dryRun: false, verbose: false, showHelp: true }
  }

  const dryRun = args.includes('--dry-run') || args.includes('-d')
  const verbose = args.includes('--verbose') || args.includes('-v')
  const limitArg = args.find(a => a.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined
  const priority = args.find(a => ['high', 'medium', 'low', 'all'].includes(a)) as Priority | undefined

  return { dryRun, verbose, limit, priority, showHelp }
}
