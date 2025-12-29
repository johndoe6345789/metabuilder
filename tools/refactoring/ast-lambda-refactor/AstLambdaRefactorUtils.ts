// Auto-generated class wrapper
import { log } from './functions/log'
import { toKebabCase } from './functions/to-kebab-case'
import { toClassName } from './functions/to-class-name'
import { createFunctionFile } from './functions/create-function-file'
import { createIndexFile } from './functions/create-index-file'
import { createClassWrapper } from './functions/create-class-wrapper'
import { replaceOriginal } from './functions/replace-original'
import { refactorFile } from './functions/refactor-file'
import { bulkRefactor } from './functions/bulk-refactor'
import { main } from './functions/main'

/**
 * AstLambdaRefactorUtils - Class wrapper for 10 functions
 * 
 * This is a convenience wrapper. Prefer importing individual functions.
 */
export class AstLambdaRefactorUtils {
  static log(...args: any[]) {
    return log(...args as any)
  }

  static toKebabCase(...args: any[]) {
    return toKebabCase(...args as any)
  }

  static toClassName(...args: any[]) {
    return toClassName(...args as any)
  }

  static async createFunctionFile(...args: any[]) {
    return await createFunctionFile(...args as any)
  }

  static async createIndexFile(...args: any[]) {
    return await createIndexFile(...args as any)
  }

  static async createClassWrapper(...args: any[]) {
    return await createClassWrapper(...args as any)
  }

  static async replaceOriginal(...args: any[]) {
    return await replaceOriginal(...args as any)
  }

  static async refactorFile(...args: any[]) {
    return await refactorFile(...args as any)
  }

  static async bulkRefactor(...args: any[]) {
    return await bulkRefactor(...args as any)
  }

  static async main(...args: any[]) {
    return await main(...args as any)
  }

}
