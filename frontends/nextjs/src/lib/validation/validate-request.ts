import type { ZodSchema } from 'zod'
import { validate, type ValidationResult } from './validate'

/** Validate request body against a Zod schema. */
export async function validateRequest<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    const body = (await request.json()) as unknown
    return validate(schema, body)
  } catch {
    return {
      success: false,
      error: {
        issues: [
          { path: '', message: 'Invalid JSON body', code: 'invalid_json' },
        ],
      },
    }
  }
}
