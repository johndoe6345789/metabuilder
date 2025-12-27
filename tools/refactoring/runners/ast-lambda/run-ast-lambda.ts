#!/usr/bin/env tsx
import { runLintFix } from '../../workflow/run-lint'
import { bulkAstRefactor } from './bulk-ast-refactor'

export const runAstLambda = async (args: string[]): Promise<void> => {
  const dryRun = args.includes('--dry-run') || args.includes('-d')
  const verbose = args.includes('--verbose') || args.includes('-v')
  const file = args.find(a => !a.startsWith('-'))

  if (!file) {
    console.error('Error: Please provide a file to refactor')
    return
  }

  await bulkAstRefactor([file], { dryRun, verbose })

  if (!dryRun) {
    console.log('\n🔧 Running linter...')
    await runLintFix(process.cwd(), message => console.log(message))
  }

  console.log('\n✨ Done!')
}

if (require.main === module) {
  const args = process.argv.slice(2)
  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.log('AST-based Lambda Refactoring Tool\n')
    console.log('Usage: tsx ast-lambda-refactor.ts [options] <file>')
    console.log('\nOptions:')
    console.log('  -d, --dry-run    Preview without writing')
    console.log('  -v, --verbose    Verbose output')
    console.log('  -h, --help       Show help')
    process.exit(0)
  }

  runAstLambda(args).catch(console.error)
}
