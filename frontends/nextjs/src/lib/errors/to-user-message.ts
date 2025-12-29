import { formatError } from './format-error'

/**
 * Convert error to user-friendly message (safe for display)
 * Strips stack traces and internal details
 */
export function toUserMessage(error: unknown): string {
  const formatted = formatError(error)
  return formatted.message || 'An unexpected error occurred'
}
