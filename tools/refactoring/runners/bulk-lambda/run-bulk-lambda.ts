#!/usr/bin/env tsx
import { runLintFix } from '../../workflow/run-lint'
import { refactorBulkFile } from './refactor-bulk-file'

export const runBulkLambda = async (args: string[]): Promise<void> => {
  const dryRun = args.includes('--dry-run') || args.includes('-d')
  const verbose = args.includes('--verbose') || args.includes('-v')
  const fileArg = args.find(arg => !arg.startsWith('-'))

  if (!fileArg) {
    console.log('Usage: tsx bulk-lambda-refactor.ts [options] <file-pattern>')
    console.log('\nOptions:')
    console.log('  -d, --dry-run    Preview changes without writing files')
    console.log('  -v, --verbose    Show detailed output')
    console.log('  -h, --help       Show this help')
    return
  }

  const result = await refactorBulkFile(fileArg, { dryRun, verbose })

  if (!dryRun && result.success) {
    console.log('\n🔧 Running linter to fix imports...')
    await runLintFix(process.cwd(), message => verbose && console.log(message))
  }

  if (result.success) {
    console.log(`\n✅ Refactored ${fileArg}`)
  } else {
    console.log(`\n⚠️  Issues encountered: ${result.errors.join('; ')}`)
  }
}

if (require.main === module) {
  const args = process.argv.slice(2)
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Bulk Lambda-per-File Refactoring Tool\n')
    console.log('Automatically refactors TypeScript files into lambda-per-file structure.')
    console.log('\nUsage: tsx bulk-lambda-refactor.ts [options] <file-pattern>')
    console.log('\nOptions:')
    console.log('  -d, --dry-run    Preview changes without writing files')
    console.log('  -v, --verbose    Show detailed output')
    console.log('  -h, --help       Show this help')
    process.exit(0)
  }

  runBulkLambda(args).catch(console.error)
}
