/**
 * The two failure results the loader produces.
 *
 * Both used to be assembled inline in different methods, with different
 * codes for what is nearly the same thing -- a validation that did not
 * finish. Keeping them together is what makes that visible.
 */

import type { ExtendedValidationResult } from './loader-types'

export type FailureCode = 'VALIDATION_FAILED' | 'VALIDATION_EXCEPTION'

function reasonOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/** A result carrying one root-level error. */
export function failedResult(
  error: unknown,
  code: FailureCode,
  validationTime?: number
): ExtendedValidationResult {
  const result: ExtendedValidationResult = {
    valid: false,
    errors: [
      {
        path: 'root',
        message: `Validation failed: ${reasonOf(error)}`,
        severity: 'error' as const,
        code,
      },
    ],
    warnings: [],
  }
  if (validationTime !== undefined) result._validationTime = validationTime
  return result
}

export function passedResult(
  validationTime: number
): ExtendedValidationResult {
  return {
    valid: true,
    errors: [],
    warnings: [],
    _validationTime: validationTime,
  }
}
