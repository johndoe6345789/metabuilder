import type { ErrorCategory } from './types'

const SUGGESTED_ACTIONS: Record<ErrorCategory, string> = {
  network: 'Check your internet connection and try again',
  authentication: 'Log in again or refresh your credentials',
  permission: 'Contact your administrator for access',
  validation: 'Please verify your input and try again',
  'not-found': 'The requested resource no longer exists',
  conflict: 'This resource already exists. Please use a different name',
  'rate-limit': 'Too many requests. Please wait a moment and try again',
  server: 'The server is experiencing issues. Please try again later',
  timeout: 'Request took too long. Please try again',
  unknown: 'Please try again or contact support',
}

/** A one-line recovery suggestion for a category, shown alongside the
 *  error so the reader has something to do rather than just a message. */
export function getSuggestedAction(category: ErrorCategory): string {
  return SUGGESTED_ACTIONS[category]
}
