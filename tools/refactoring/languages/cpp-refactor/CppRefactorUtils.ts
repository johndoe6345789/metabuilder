// Auto-generated class wrapper
import { getFunctionExtension } from './functions/get-function-extension'
import { extractFunctions } from './functions/extract-functions'
import { extractDependencies } from './functions/extract-dependencies'
import { generateFunctionFile } from './functions/generate-function-file'
import { generateModule } from './functions/generate-module'
import { generateHeaderFile } from './functions/generate-header-file'

/**
 * CppRefactorUtils - Class wrapper for 6 functions
 * 
 * This is a convenience wrapper. Prefer importing individual functions.
 */
export class CppRefactorUtils {
  static getFunctionExtension(...args: Parameters<typeof getFunctionExtension>) {
    return getFunctionExtension(...args)
  }

  static async extractFunctions(...args: Parameters<typeof extractFunctions>) {
    return await extractFunctions(...args)
  }

  static async extractDependencies(...args: Parameters<typeof extractDependencies>) {
    return await extractDependencies(...args)
  }

  static generateFunctionFile(...args: Parameters<typeof generateFunctionFile>) {
    return generateFunctionFile(...args)
  }

  static async generateModule(...args: Parameters<typeof generateModule>) {
    return await generateModule(...args)
  }

  static generateHeaderFile(...args: Parameters<typeof generateHeaderFile>) {
    return generateHeaderFile(...args)
  }

}
