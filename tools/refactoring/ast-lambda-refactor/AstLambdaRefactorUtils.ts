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
  static log(...args: Parameters<typeof log>) {
    return log(...args)
  }

  static toKebabCase(...args: Parameters<typeof toKebabCase>) {
    return toKebabCase(...args)
  }

  static toClassName(...args: Parameters<typeof toClassName>) {
    return toClassName(...args)
  }

  static async createFunctionFile(...args: Parameters<typeof createFunctionFile>) {
    return await createFunctionFile(...args)
  }

  static async createIndexFile(...args: Parameters<typeof createIndexFile>) {
    return await createIndexFile(...args)
  }

  static async createClassWrapper(...args: Parameters<typeof createClassWrapper>) {
    return await createClassWrapper(...args)
  }

  static async replaceOriginal(...args: Parameters<typeof replaceOriginal>) {
    return await replaceOriginal(...args)
  }

  static async refactorFile(...args: Parameters<typeof refactorFile>) {
    return await refactorFile(...args)
  }

  static async bulkRefactor(...args: Parameters<typeof bulkRefactor>) {
    return await bulkRefactor(...args)
  }

  static async main(...args: Parameters<typeof main>) {
    return await main(...args)
  }

}
