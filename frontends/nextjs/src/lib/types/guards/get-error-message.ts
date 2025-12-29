import { isError } from './is-error'
import { isErrorLike } from './is-error-like'

/**
 * Safely extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) return error.message
  if (isErrorLike(error)) return error.message
  if (typeof error === 'string') return error
  return 'An unknown error occurred'
}
