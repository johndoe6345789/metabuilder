/**
 * Looking a code up in the three tables, without trusting them to be complete.
 *
 * A missing entry used to mean `undefined` reached the response: no status,
 * or a message reading "undefined". These fall back instead, so a code added
 * without its tables degrades to a generic 500 rather than a malformed reply.
 * The test asserts the tables are complete; this is what happens if that ever
 * stops being true in production.
 */

import { WorkflowErrorCode } from './error-codes'
import { ERROR_HINTS } from './error-hints'
import { ERROR_MESSAGES } from './error-messages'
import { ERROR_STATUS_MAP } from './error-status'

export const FALLBACK_STATUS = 500
export const FALLBACK_MESSAGE = 'Workflow request failed'

export function statusFor(code: WorkflowErrorCode): number {
  return ERROR_STATUS_MAP[code] ?? FALLBACK_STATUS
}

export function messageFor(code: WorkflowErrorCode): string {
  return ERROR_MESSAGES[code] ?? FALLBACK_MESSAGE
}

/** Hints are advisory, so an absent one is empty rather than invented. */
export function hintFor(code: WorkflowErrorCode): string {
  return ERROR_HINTS[code] ?? ''
}

/** True when the caller could plausibly fix this themselves. */
export function isClientError(code: WorkflowErrorCode): boolean {
  const status = statusFor(code)
  return status >= 400 && status < 500
}
