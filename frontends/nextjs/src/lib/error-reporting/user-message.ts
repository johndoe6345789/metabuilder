import type { ErrorCategory } from './types'

const CATEGORY_MESSAGES: Record<ErrorCategory, string> = {
  network:
    'Network error. Please check your internet connection and try again.',
  authentication: 'Your session has expired. Please log in again.',
  permission: 'You do not have permission to perform this action.',
  validation:
    'The information you provided is invalid. Please check and try again.',
  'not-found': 'The requested resource was not found.',
  conflict: 'This resource already exists. Please use a different name.',
  'rate-limit': 'Too many requests. Please wait a moment and try again.',
  server:
    'A server error occurred. Our team has been notified. Please try again later.',
  timeout: 'The request took too long to complete. Please try again.',
  unknown:
    'An error occurred. Please try again or contact support if the problem persists.',
}

/** The production-facing message for a category -- generic on purpose,
 *  so it never leaks internal detail the way a raw error message can. */
export function categoryMessage(category: ErrorCategory): string {
  return CATEGORY_MESSAGES[category]
}
