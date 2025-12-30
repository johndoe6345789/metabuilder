import * as path from 'path'
import { analyzeAstFile, astNameHelpers } from './ast/analyze-ast-file'
import { AstExtractedFunction, ExtractedImport } from './lambda/types'
import { buildAstFunctionContent } from './io/build-ast-function-content'
import { buildClassWrapper } from './io/build-class-wrapper'
import { buildIndexContent } from './io/build-index-content'
import { writeFileSafely } from './io/write-file'
import { runLintFix } from './workflow/run-lint'

export async function refactorFile(filePath: string): Promise<void> {
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
