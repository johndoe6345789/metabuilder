#!/usr/bin/env tsx
/**
 * AST-based Lambda Refactoring Tool
 */

import * as path from 'path'
import { analyzeAstFile, astNameHelpers } from './ast/analyze-ast-file'
import { AstExtractedFunction, ExtractedImport } from './lambda/types'
import { buildAstFunctionContent } from './io/build-ast-function-content'
import { buildClassWrapper } from './io/build-class-wrapper'
import { buildIndexContent } from './io/build-index-content'
import { writeFileSafely } from './io/write-file'
import { runLintFix } from './workflow/run-lint'

class ASTLambdaRefactor {
  private dryRun: boolean
  private verbose: boolean

  constructor(options: { dryRun?: boolean; verbose?: boolean } = {}) {
    this.dryRun = options.dryRun || false
    this.verbose = options.verbose || false
  }

  private log(message: string) {
    if (this.verbose) {
      console.log(message)
    }
  }

  private toKebabCase(name: string) {
    return astNameHelpers.toKebabCase(name)
  }

  private toClassName(name: string) {
    return astNameHelpers.toClassName(name)
  }

  private async createFunctionFile(
    func: AstExtractedFunction,
    imports: ExtractedImport[],
    outputPath: string
  ) {
    const content = buildAstFunctionContent(func, imports)
    await writeFileSafely(outputPath, content, this.dryRun)
  }

  private async createIndexFile(functions: AstExtractedFunction[], functionsDir: string, outputPath: string) {
    const indexContent = buildIndexContent(functions, functionsDir)
    await writeFileSafely(outputPath, indexContent, this.dryRun)
  }

  private async createClassWrapper(className: string, functions: AstExtractedFunction[], outputPath: string) {
    const classContent = buildClassWrapper(className, functions, 'functions')
    await writeFileSafely(outputPath, classContent, this.dryRun)
  }

  private async replaceOriginal(filePath: string, basename: string, className: string, sampleFunction: string) {
    const newMainContent = `/**
 * This file has been refactored into modular lambda-per-file structure.
 *
 * Import individual functions or use the class wrapper:
 * @example
 * import { ${sampleFunction} } from './${basename}'
 *
 * @example
 * import { ${className} } from './${basename}'
 * ${className}.${sampleFunction}(...)
 */

export * from './${basename}'
`

    await writeFileSafely(filePath, newMainContent, this.dryRun)
    this.log(`    ✓ Updated ${path.basename(filePath)}`)
  }

  async refactorFile(filePath: string): Promise<void> {
    this.log(`\n🔍 Analyzing ${filePath}...`)

    const { functions, imports } = await analyzeAstFile(filePath)

    if (functions.length === 0) {
      this.log('  ⏭️  No functions found - skipping')
      return
    }

    if (functions.length <= 2) {
      this.log(`  ⏭️  Only ${functions.length} function(s) - skipping (not worth refactoring)`)
      return
    }

    this.log(`  Found ${functions.length} functions: ${functions.map(f => f.name).join(', ')}`)

    const dir = path.dirname(filePath)
    const basename = path.basename(filePath, path.extname(filePath))
    const functionsDir = path.join(dir, basename, 'functions')

    this.log(`  Creating: ${functionsDir}`)

    for (const func of functions) {
      const kebabName = this.toKebabCase(func.name)
      const funcFile = path.join(functionsDir, `${kebabName}.ts`)

      await this.createFunctionFile(func, imports, funcFile)
      this.log(`    ✓ ${kebabName}.ts`)
    }

    const indexPath = path.join(dir, basename, 'index.ts')
    await this.createIndexFile(functions, 'functions', indexPath)
    this.log(`    ✓ index.ts`)

    const className = this.toClassName(basename)
    const classPath = path.join(dir, basename, `${className}.ts`)
    await this.createClassWrapper(className, functions, classPath)
    this.log(`    ✓ ${className}.ts`)

    await this.replaceOriginal(filePath, basename, className, functions[0].name)

    this.log(`  ✅ Refactored into ${functions.length + 2} files`)
  }

  async bulkRefactor(files: string[]): Promise<void> {
    console.log(`\n📦 AST-based Lambda Refactoring`)
    console.log(`   Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE'}`)
    console.log(`   Files: ${files.length}\n`)

    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      console.log(`[${i + 1}/${files.length}] ${file}`)

      try {
        await this.refactorFile(file)
        successCount++
      } catch (error) {
        if (error instanceof Error && error.message.includes('skipping')) {
          skipCount++
        } else {
          console.error(`  ❌ Error: ${error}`)
          errorCount++
        }
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`   ✅ Success: ${successCount}`)
    console.log(`   ⏭️  Skipped: ${skipCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
  }
}

async function main() {
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

if (require.main === module) {
  main().catch(console.error)
}

export { ASTLambdaRefactor }
