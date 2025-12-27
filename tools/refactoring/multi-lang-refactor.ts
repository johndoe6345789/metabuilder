#!/usr/bin/env tsx
/**
 * Multi-Language Lambda Refactoring Tool
 *
 * Supports both TypeScript and C++ refactoring into lambda-per-file structure
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import { CppLambdaRefactor } from './languages/cpp-refactor'
import { TypeScriptLambdaRefactor } from './languages/typescript/typescript-lambda-refactor'
import { DependencyInfo, FunctionInfo, Language, RefactorResult } from './languages/types'

class MultiLanguageLambdaRefactor {
  private dryRun: boolean = false
  private verbose: boolean = false
  private readonly tsService: TypeScriptLambdaRefactor
  private readonly cppService: CppLambdaRefactor

  constructor(options: { dryRun?: boolean; verbose?: boolean } = {}) {
    this.dryRun = options.dryRun || false
    this.verbose = options.verbose || false
    this.tsService = new TypeScriptLambdaRefactor({ dryRun: this.dryRun, log: this.log.bind(this) })
    this.cppService = new CppLambdaRefactor({ dryRun: this.dryRun, log: this.log.bind(this) })
  }

  private log(message: string) {
    if (this.verbose) {
      console.log(message)
    }
  }

  detectLanguage(filePath: string): Language {
    const ext = path.extname(filePath).toLowerCase()
    if (ext === '.cpp' || ext === '.cc' || ext === '.cxx' || ext === '.hpp' || ext === '.h') {
      return 'cpp'
    }
    return 'typescript'
  }

  async refactorFile(filePath: string): Promise<RefactorResult> {
    const result: RefactorResult = {
      success: false,
      originalFile: filePath,
      newFiles: [],
      errors: [],
    }

    try {
      const language = this.detectLanguage(filePath)
      this.log(`\n🔍 Analyzing ${filePath} (${language})...`)

      if (language === 'typescript') {
        const tsResult = await this.tsService.generateModule(filePath)
        result.success = tsResult.success
        result.newFiles = tsResult.newFiles
        result.errors = tsResult.errors
        return result
      }

      const functions = await this.cppService.extractFunctions(filePath)
      if (functions.length === 0) {
        result.errors.push('No functions found to extract')
        return result
      }
      if (functions.length <= 2) {
        result.errors.push(`Only ${functions.length} function(s) - skipping`)
        return result
      }

      this.log(`  Found ${functions.length} functions: ${functions.map(f => f.name).join(', ')}`)
      const dependencies = await this.cppService.extractDependencies(filePath)

      const dir = path.dirname(filePath)
      const ext = path.extname(filePath)
      const basename = path.basename(filePath, ext)
      const functionsDir = path.join(dir, basename, 'functions')

      if (!this.dryRun) {
        await fs.mkdir(functionsDir, { recursive: true })
      }

      for (const func of functions) {
        const kebabName = func.name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
        const funcExt = this.cppService.getFunctionExtension()
        const funcFilePath = path.join(functionsDir, `${kebabName}${funcExt}`)
        const content = this.cppService.generateFunctionFile(func, dependencies.imports)

        if (!this.dryRun) {
          await fs.writeFile(funcFilePath, content, 'utf-8')
        }

        result.newFiles.push(funcFilePath)
        this.log(`    ✓ ${kebabName}${funcExt}`)
      }

      await this.cppService.generateModule({ dir, basename, functions, functionsDir, dependencies, result })

      result.success = true
      this.log(`  ✅ Successfully refactored into ${result.newFiles.length} files`)
    } catch (error) {
      result.errors.push(`Error: ${error instanceof Error ? error.message : String(error)}`)
      this.log(`  ❌ Failed: ${result.errors[0]}`)
    }

    return result
  }

  async bulkRefactor(files: string[]): Promise<RefactorResult[]> {
    console.log(`\n📦 Multi-Language Lambda Refactoring`)
    console.log(`   Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE'}`)
    console.log(`   Files: ${files.length}\n`)

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

    return results
  }
}

export { MultiLanguageLambdaRefactor }
