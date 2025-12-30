import * as path from 'path'
import { extractFunctions } from './parsing/extract-functions'
import { extractImportsAndTypes } from './parsing/extract-imports-and-types'
import { buildFunctionContent } from './io/build-function-content'
import { buildClassWrapper } from './io/build-class-wrapper'
import { buildIndexContent } from './io/build-index-content'
import { writeFileSafely } from './io/write-file'
import { runLintFix } from './workflow/run-lint'
import { FunctionInfo } from './lambda/types'

export async function main() {
  const args = process.argv.slice(2)

  const dryRun = args.includes('--dry-run') || args.includes('-d')
  const verbose = args.includes('--verbose') || args.includes('-v')
  const filesArg = args.find(arg => !arg.startsWith('-'))

  if (!filesArg && !args.includes('--help') && !args.includes('-h')) {
    console.log('Usage: tsx bulk-lambda-refactor.ts [options] <file-pattern>')
    console.log('\nOptions:')
    console.log('  -d, --dry-run    Preview changes without writing files')
    console.log('  -v, --verbose    Show detailed output')
    console.log('  -h, --help       Show this help')
    console.log('\nExamples:')
    console.log('  tsx bulk-lambda-refactor.ts --dry-run "frontends/nextjs/src/lib/**/*.ts"')
    console.log('  tsx bulk-lambda-refactor.ts --verbose frontends/nextjs/src/lib/rendering/page/page-definition-builder.ts')
    process.exit(1)
  }

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

  const refactor = new BulkLambdaRefactor({ dryRun, verbose })
  const files = [filesArg!]

  const results = await refactor.bulkRefactor(files)

  if (!dryRun && results.some(r => r.success)) {
    console.log('\n🔧 Running linter to fix imports...')
    await refactor.runLintFix(process.cwd())
  }

  console.log('\n✨ Done!')
}
