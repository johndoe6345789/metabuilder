import type { ZodSchema } from 'zod'
import { validate, type ValidationResult } from './validate'

/**
 * Create a package-specific validator factory.
 *
 * Usage in package:
 * ```ts
 * const validate = createPackageValidator('my_package')
 * const result = validate(MySchema, data)
 * ```
 */
export function createPackageValidator(packageId: string) {
  return function <T>(
    schema: ZodSchema<T>,
    data: unknown
  ): ValidationResult<T> {
    const result = validate(schema, data)
    if (!result.success) {
      // Add package context to errors
      result.error.issues = result.error.issues.map(issue => ({
        ...issue,
        path: `${packageId}.${issue.path}`,
      }))
    }
    return result
  }
}
