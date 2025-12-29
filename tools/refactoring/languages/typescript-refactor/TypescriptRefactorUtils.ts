// Auto-generated class wrapper
import { getFunctionExtension } from './functions/get-function-extension'
import { extractFunctions } from './functions/extract-functions'
import { extractDependencies } from './functions/extract-dependencies'
import { generateFunctionFile } from './functions/generate-function-file'
import { generateModule } from './functions/generate-module'
import { generateClassWrapper } from './functions/generate-class-wrapper'
import { generateIndexFile } from './functions/generate-index-file'

/**
 * TypescriptRefactorUtils - Class wrapper for 7 functions
 * 
 * This is a convenience wrapper. Prefer importing individual functions.
 */
export class TypescriptRefactorUtils {
  static getFunctionExtension(...args: any[]) {
    return getFunctionExtension(...args as any)
  }

  static async extractFunctions(...args: any[]) {
    return await extractFunctions(...args as any)
  }

  static async extractDependencies(...args: any[]) {
    return await extractDependencies(...args as any)
  }

  static generateFunctionFile(...args: any[]) {
    return generateFunctionFile(...args as any)
  }

  static async generateModule(...args: any[]) {
    return await generateModule(...args as any)
  }

  static generateClassWrapper(...args: any[]) {
    return generateClassWrapper(...args as any)
  }

  static generateIndexFile(...args: any[]) {
    return generateIndexFile(...args as any)
  }

}
