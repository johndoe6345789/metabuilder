import * as path from 'path'
import { analyzeAstFile, astNameHelpers } from './ast/analyze-ast-file'
import { AstExtractedFunction, ExtractedImport } from './lambda/types'
import { buildAstFunctionContent } from './io/build-ast-function-content'
import { buildClassWrapper } from './io/build-class-wrapper'
import { buildIndexContent } from './io/build-index-content'
import { writeFileSafely } from './io/write-file'
import { runLintFix } from './workflow/run-lint'

export async function bulkRefactor(files: string[]): Promise<void> {
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
