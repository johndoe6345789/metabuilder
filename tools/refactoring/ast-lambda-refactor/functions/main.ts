import * as path from 'path'
import { analyzeAstFile, astNameHelpers } from './ast/analyze-ast-file'
import { AstExtractedFunction, ExtractedImport } from './lambda/types'
import { buildAstFunctionContent } from './io/build-ast-function-content'
import { buildClassWrapper } from './io/build-class-wrapper'
import { buildIndexContent } from './io/build-index-content'
import { writeFileSafely } from './io/write-file'
import { runLintFix } from './workflow/run-lint'

export async function main() {
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

  const dryRun = args.includes('--dry-run') || args.includes('-d')
  const verbose = args.includes('--verbose') || args.includes('-v')
  const file = args.find(a => !a.startsWith('-'))

  if (!file) {
    console.error('Error: Please provide a file to refactor')
    process.exit(1)
  }

  const refactor = new ASTLambdaRefactor({ dryRun, verbose })
  await refactor.bulkRefactor([file])

  if (!dryRun) {
    console.log('\n🔧 Running linter...')
    await runLintFix(process.cwd(), message => console.log(message))
  }

  console.log('\n✨ Done!')
}
