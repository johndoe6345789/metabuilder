import { setCredential as setCredentialRecord } from '@/lib/db/credentials'
import type { SecurityContext } from '../types'
import { executeQuery } from '../execute-query'
import { sanitizeInput } from '../sanitize-input'

/**
 * Set user credential with security checks
 */
export async function setCredential(
  ctx: SecurityContext,
  username: string,
  passwordHash: string
): Promise<void> {
  const sanitized = sanitizeInput({ username, passwordHash })

  return executeQuery(
    ctx,
    'credential',
    'UPDATE',
    async () => {
      await setCredentialRecord(sanitized.username, sanitized.passwordHash)
    },
    sanitized.username
  )
}
