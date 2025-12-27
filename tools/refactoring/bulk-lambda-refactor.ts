#!/usr/bin/env tsx
/**
 * Bulk Lambda-per-File Refactoring Tool
 */

import * as path from 'path'
import { extractFunctions } from './parsing/extract-functions'
import { extractImportsAndTypes } from './parsing/extract-imports-and-types'
import { buildFunctionContent } from './io/build-function-content'
import { buildClassWrapper } from './io/build-class-wrapper'
import { buildIndexContent } from './io/build-index-content'
import { writeFileSafely } from './io/write-file'
import { runLintFix } from './workflow/run-lint'
import { FunctionInfo } from './lambda/types'

interface RefactorResult {
  success: boolean
  originalFile: string
  newFiles: string[]
  errors: string[]
}

class BulkLambdaRefactor {
  private dryRun: boolean = false
  private verbose: boolean = false

  constructor(options: { dryRun?: boolean; verbose?: boolean } = {}) {
    this.dryRun = options.dryRun || false
    this.verbose = options.verbose || false
  }

  private log(message: string) {
    if (this.verbose) {
      console.log(message)
    }
  }

  private toKebabCase(name: string): string {
    return name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
  }

  private toClassName(name: string): string {
    return name
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('') + 'Utils'
  }

  private async writeFunctions(
    functions: FunctionInfo[],
    imports: string[],
    types: string[],
    functionsDir: string,
    result: RefactorResult
  ) {
    for (const func of functions) {
      const kebabName = this.toKebabCase(func.name)
      const funcFilePath = path.join(functionsDir, `${kebabName}.ts`)
      const content = buildFunctionContent(func, imports, types)

      await writeFileSafely(funcFilePath, content, this.dryRun)

      result.newFiles.push(funcFilePath)
      this.log(`    ✓ ${kebabName}.ts`)
    }
  }

  private async writeClassWrapper(
    basename: string,
    functions: FunctionInfo[],
    dir: string,
    result: RefactorResult
  ) {
    const className = this.toClassName(basename)
    const classFilePath = path.join(dir, basename, `${className}.ts`)
    const classContent = buildClassWrapper(className, functions, 'functions')

    await writeFileSafely(classFilePath, classContent, this.dryRun)

    result.newFiles.push(classFilePath)
    this.log(`    ✓ ${className}.ts (class wrapper)`)

    return className
  }

  private async writeIndex(
    functions: FunctionInfo[],
    dir: string,
    basename: string,
    className: string,
    result: RefactorResult
  ) {
    const indexFilePath = path.join(dir, basename, 'index.ts')
    const indexContent = buildIndexContent(functions, 'functions', className)

    await writeFileSafely(indexFilePath, indexContent, this.dryRun)

    result.newFiles.push(indexFilePath)
    this.log('    ✓ index.ts (re-exports)')
  }

  private async writeReexportFile(filePath: string, basename: string) {
    const reexportContent = `// This file has been refactored into modular functions\\n` +
                           `// Import from individual functions or use the class wrapper\\n\\n` +
                           `export * from './${basename}'\\n`

    await writeFileSafely(filePath, reexportContent, this.dryRun)
    this.log(`    ✓ Updated ${path.basename(filePath)} to re-export`)
  }

  async refactorFile(filePath: string): Promise<RefactorResult> {
    const result: RefactorResult = {
      success: false,
      originalFile: filePath,
      newFiles: [],
      errors: [],
    }

    try {
      this.log(`\n🔍 Analyzing ${filePath}...`)

      const functions = await extractFunctions(filePath)

      if (functions.length === 0) {
        result.errors.push('No functions found to extract')
        return result
      }

      if (functions.length <= 2) {
        result.errors.push(`Only ${functions.length} function(s) - skipping`)
        return result
      }

      this.log(`  Found ${functions.length} functions: ${functions.map(f => f.name).join(', ')}`)

      const { imports, types } = await extractImportsAndTypes(filePath)

      const dir = path.dirname(filePath)
      const basename = path.basename(filePath, path.extname(filePath))
      const functionsDir = path.join(dir, basename, 'functions')

      await this.writeFunctions(functions, imports, types, functionsDir, result)

      const className = await this.writeClassWrapper(basename, functions, dir, result)

      await this.writeIndex(functions, dir, basename, className, result)

      await this.writeReexportFile(filePath, basename)

      result.success = true
      this.log(`  ✅ Successfully refactored into ${result.newFiles.length} files`)
    } catch (error) {
      result.errors.push(`Error: ${error instanceof Error ? error.message : String(error)}`)
      this.log(`  ❌ Failed: ${result.errors[0]}`)
    }

    return result
  }

  async bulkRefactor(files: string[]): Promise<RefactorResult[]> {
    console.log(`\n📦 Bulk Lambda Refactoring Tool`)
    console.log(`   Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE'}`)
    console.log(`   Files to process: ${files.length}\n`)

    const results: RefactorResult[] = []
    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      console.log(`[${i + 1}/${files.length}] Processing: ${file}`)

      const result = await this.refactorFile(file)
      results.push(result)

      if (result.success) {
        successCount++
      } else if (result.errors.some(e => e.includes('skipping'))) {
        skipCount++
      } else {
        errorCount++
      }

      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log(`\n📊 Summary:`)
    console.log(`   ✅ Success: ${successCount}`)
    console.log(`   ⏭️  Skipped: ${skipCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
    console.log(`   📁 Total new files: ${results.reduce((acc, r) => acc + r.newFiles.length, 0)}`)

    return results
  }

  async runLintFix(workingDir: string): Promise<void> {
    await runLintFix(workingDir, message => this.log(message))
  }
}

async function main() {
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

if (require.main === module) {
  main().catch(console.error)
}

export { BulkLambdaRefactor }
