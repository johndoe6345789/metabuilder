import * as path from 'path'
import { extractFunctions } from '../../parsing/extract-functions'
import { extractImportsAndTypes } from '../../parsing/extract-imports-and-types'
import { FunctionInfo } from '../../lambda/types'
import { writeFunctionFiles } from './write-function-files'
import { writeWrapperAndIndex } from './write-wrapper-and-index'

export const refactorBulkFile = async (
  filePath: string,
  options: { dryRun: boolean; verbose: boolean }
): Promise<{ success: boolean; newFiles: string[]; errors: string[] }> => {
  const result = { success: false, newFiles: [] as string[], errors: [] as string[] }

  try {
    if (options.verbose) console.log(`\n🔍 Analyzing ${filePath}...`)

    const functions = await extractFunctions(filePath)
    if (functions.length === 0) {
      result.errors.push('No functions found to extract')
      return result
    }

    if (functions.length <= 2) {
      result.errors.push(`Only ${functions.length} function(s) - skipping`)
      return result
    }

    const { imports, types } = await extractImportsAndTypes(filePath)
    const dir = path.dirname(filePath)
    const basename = path.basename(filePath, path.extname(filePath))
    const functionsDir = path.join(dir, basename, 'functions')

    const functionFiles = await writeFunctionFiles(functions, imports, types, functionsDir, options.dryRun)
    const { files: wrapperFiles } = await writeWrapperAndIndex(basename, functions, dir, options.dryRun)

    result.newFiles.push(...functionFiles, ...wrapperFiles)
    result.success = true

    if (options.verbose) {
      console.log(`  ✅ Successfully refactored into ${result.newFiles.length} files`)
    }
  } catch (error) {
    result.errors.push(`Error: ${error instanceof Error ? error.message : String(error)}`)
  }

  return result
}
