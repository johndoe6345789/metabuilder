import * as path from 'path'
import { extractFunctions } from './parsing/extract-functions'
import { extractImportsAndTypes } from './parsing/extract-imports-and-types'
import { buildFunctionContent } from './io/build-function-content'
import { buildClassWrapper } from './io/build-class-wrapper'
import { buildIndexContent } from './io/build-index-content'
import { writeFileSafely } from './io/write-file'
import { runLintFix } from './workflow/run-lint'
import { FunctionInfo } from './lambda/types'

export async function refactorFile(filePath: string): Promise<RefactorResult> {
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
