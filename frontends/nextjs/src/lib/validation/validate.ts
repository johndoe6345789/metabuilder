import type { ZodSchema } from 'zod'
import { formatZodError, type ValidationError } from './format-zod-error'

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: ValidationError }

/** Validate data against a Zod schema. */
export function validate<T>(
  schema: ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: formatZodError(result.error) }
}
