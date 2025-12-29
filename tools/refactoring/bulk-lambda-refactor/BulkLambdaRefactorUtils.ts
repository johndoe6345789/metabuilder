// Auto-generated class wrapper
import { log } from './functions/log'
import { toKebabCase } from './functions/to-kebab-case'
import { toClassName } from './functions/to-class-name'
import { writeFunctions } from './functions/write-functions'
import { writeClassWrapper } from './functions/write-class-wrapper'
import { writeIndex } from './functions/write-index'
import { writeReexportFile } from './functions/write-reexport-file'
import { refactorFile } from './functions/refactor-file'
import { bulkRefactor } from './functions/bulk-refactor'
import { runLintFix } from './functions/run-lint-fix'
import { main } from './functions/main'

/**
 * BulkLambdaRefactorUtils - Class wrapper for 11 functions
 * 
 * This is a convenience wrapper. Prefer importing individual functions.
 */
export class BulkLambdaRefactorUtils {
  static log(...args: any[]) {
    return log(...args as any)
  }

  static toKebabCase(...args: any[]) {
    return toKebabCase(...args as any)
  }

  static toClassName(...args: any[]) {
    return toClassName(...args as any)
  }

  static async writeFunctions(...args: any[]) {
    return await writeFunctions(...args as any)
  }

  static async writeClassWrapper(...args: any[]) {
    return await writeClassWrapper(...args as any)
  }

  static async writeIndex(...args: any[]) {
    return await writeIndex(...args as any)
  }

  static async writeReexportFile(...args: any[]) {
    return await writeReexportFile(...args as any)
  }

  static async refactorFile(...args: any[]) {
    return await refactorFile(...args as any)
  }

  static async bulkRefactor(...args: any[]) {
    return await bulkRefactor(...args as any)
  }

  static async runLintFix(...args: any[]) {
    return await runLintFix(...args as any)
  }

  static async main(...args: any[]) {
    return await main(...args as any)
  }

}
