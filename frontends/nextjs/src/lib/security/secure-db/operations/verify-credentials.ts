import { Database } from '@/lib/db'
import type { SecurityContext } from '../types'
import { executeQuery } from '../execute-query'
import { sanitizeInput } from '../sanitize-input'

/**
 * Verify user credentials with security checks
 */
export async function verifyCredentials(
  ctx: SecurityContext, 
  username: string, 
  password: string
): Promise<boolean> {
  const sanitizedUsername = sanitizeInput(username)

  // TODO: Track failed login attempts and enforce account lockout/backoff.
  
  return executeQuery(
    ctx,
    'credential',
    'READ',
    async () => Database.verifyCredentials(sanitizedUsername, password),
    sanitizedUsername
  )
}
