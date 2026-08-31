/**
 * Zod validation utilities for packages
 *
 * Provides standardized validation patterns for package data, API requests,
 * and configuration validation.
 *
 * Usage:
 * ```ts
 * import { z } from 'zod'
 * import { validateRequest, createPackageValidator } from '@/lib/validation'
 *
 * // Define your schema
 * const MyDataSchema = z.object({
 *   name: z.string().min(1),
 *   count: z.number().int().positive(),
 * })
 *
 * // In API route
 * const result = await validateRequest(request, MyDataSchema)
 * if (!result.success) {
 *   return Errors.validationError(result.error)
 * }
 * const data = result.data
 * ```
 */
import { z } from 'zod'

export { z }

export type { ValidationError } from './format-zod-error'
export { formatZodError } from './format-zod-error'
export type { ValidationResult } from './validate'
export { validate } from './validate'
export { validateRequest } from './validate-request'
export { CommonSchemas } from './common-schemas'
export { PackageSchemas } from './package-schemas'
export { UserSchemas } from './user-schemas'
export { createPackageValidator } from './create-package-validator'
