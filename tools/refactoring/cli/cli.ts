#!/usr/bin/env tsx
import { MultiLanguageLambdaRefactor } from '../multi-lang-refactor'

function printHelp() {
  console.log('Multi-Language Lambda Refactoring Tool\n')
  console.log('Supports: TypeScript (.ts, .tsx) and C++ (.cpp, .hpp, .cc, .h)\n')
  console.log('Usage: tsx tools/refactoring/cli/cli.ts [options] <file>')
  console.log('\nOptions:')
  console.log('  -d, --dry-run    Preview without writing')
  console.log('  -v, --verbose    Verbose output')
  console.log('  -h, --help       Show help')
  console.log('\nExamples:')
  console.log('  tsx tools/refactoring/cli/cli.ts --dry-run src/utils.ts')
  console.log('  tsx tools/refactoring/cli/cli.ts --verbose dbal/src/adapter.cpp')
}

export async function handler(argv: string[] = process.argv.slice(2)) {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printHelp()
    return { status: 'help' }
  }

  const dryRun = argv.includes('--dry-run') || argv.includes('-d')
  const verbose = argv.includes('--verbose') || argv.includes('-v')
  const files = argv.filter(a => !a.startsWith('-'))

  if (files.length === 0) {
    throw new Error('Error: Please provide file(s) to refactor')
  }

  const refactor = new MultiLanguageLambdaRefactor({ dryRun, verbose })
  await refactor.bulkRefactor(files)

  console.log('\n✨ Done!')
  return { status: 'ok' }
}

if (require.main === module) {
  handler().catch(error => {
    console.error(error)
    process.exit(1)
  })
}
