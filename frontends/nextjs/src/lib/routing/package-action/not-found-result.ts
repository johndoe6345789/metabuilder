import type { PackageActionResult } from './types'

/** A NOT_FOUND result -- the message is hidden when `allowFallback` is
 *  set, since the caller wants to try a different route on 404 rather
 *  than surface this package's specific reason for it. */
export function notFoundResult(
  message: string,
  allowFallback?: boolean
): PackageActionResult {
  return allowFallback === true
    ? { success: false, code: 'NOT_FOUND' }
    : { success: false, error: message, code: 'NOT_FOUND' }
}
