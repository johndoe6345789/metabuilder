import type { ErrorCategory } from './types'

const RETRYABLE_CATEGORIES: ErrorCategory[] = [
  'network',
  'timeout',
  'rate-limit',
  'server',
]

const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504]

/** Whether trying the same request again has a real chance of succeeding
 *  -- transient network/server conditions, not a client-side mistake. */
export function isErrorRetryable(
  category: ErrorCategory,
  statusCode?: number
): boolean {
  if (RETRYABLE_CATEGORIES.includes(category)) return true
  if (statusCode != null && RETRYABLE_STATUS_CODES.includes(statusCode)) {
    return true
  }
  return false
}
