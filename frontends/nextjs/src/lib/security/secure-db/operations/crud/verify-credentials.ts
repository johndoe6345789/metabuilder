import { Database } from '@/lib/db'
import type { SecurityContext } from '../types'
import { executeQuery } from '../execute-query'
import { sanitizeInput } from '../sanitize-input'
import { loginAttemptTracker } from '../login-attempt-tracker'

/**
 * Verify user credentials with security checks
 */
export async function verifyCredentials(
  ctx: SecurityContext, 
  username: string, 
  password: string
): Promise<boolean> {
  const sanitizedUsername = sanitizeInput(username).trim()

  if (loginAttemptTracker.isLocked(sanitizedUsername)) {
    return false
  }

  const isValid = await executeQuery(
    ctx,
    'credential',
    'READ',
    async () => Database.verifyCredentials(sanitizedUsername, password),
    sanitizedUsername
  )

  if (!isValid) {
    loginAttemptTracker.registerFailure(sanitizedUsername)
    return false
  }

  loginAttemptTracker.registerSuccess(sanitizedUsername)
  return true
}
