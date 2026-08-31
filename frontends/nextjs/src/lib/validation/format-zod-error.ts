import type { ZodError, ZodIssue } from 'zod'

export interface ValidationError {
  issues: Array<{
    path: string
    message: string
    code: string
  }>
}

/** Format Zod errors into a standardized format. */
export function formatZodError(error: ZodError): ValidationError {
  return {
    issues: error.issues.map((issue: ZodIssue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    })),
  }
}
