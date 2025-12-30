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
  static log(...args: Parameters<typeof log>) {
    return log(...args)
  }

  static toKebabCase(...args: Parameters<typeof toKebabCase>) {
    return toKebabCase(...args)
  }

  static toClassName(...args: Parameters<typeof toClassName>) {
    return toClassName(...args)
  }

  static async writeFunctions(...args: Parameters<typeof writeFunctions>) {
    return await writeFunctions(...args)
  }

  static async writeClassWrapper(...args: Parameters<typeof writeClassWrapper>) {
    return await writeClassWrapper(...args)
  }

  static async writeIndex(...args: Parameters<typeof writeIndex>) {
    return await writeIndex(...args)
  }

  static async writeReexportFile(...args: Parameters<typeof writeReexportFile>) {
    return await writeReexportFile(...args)
  }

  static async refactorFile(...args: Parameters<typeof refactorFile>) {
    return await refactorFile(...args)
  }

  static async bulkRefactor(...args: Parameters<typeof bulkRefactor>) {
    return await bulkRefactor(...args)
  }

  static async runLintFix(...args: Parameters<typeof runLintFix>) {
    return await runLintFix(...args)
  }

  static async main(...args: Parameters<typeof main>) {
    return await main(...args)
  }

}
