import { DBALError } from '@/dbal/core/foundation/errors'
import { getErrorMessage, isError } from '@/lib/types/guards'
import type { FormattedError } from './interfaces/formatted-error'

/**
 * Format any error into a consistent structure
 */
export function formatError(error: unknown): FormattedError {
  // Handle DBALError
  if (error instanceof DBALError) {
    return {
      message: error.message,
      code: error.code,
      details: error.details,
    }
  }

  // Handle standard Error
  if (isError(error)) {
    return {
      message: error.message,
      stack: error.stack,
    }
  }

  // Handle error-like objects and other types
  return {
    message: getErrorMessage(error),
  }
}
