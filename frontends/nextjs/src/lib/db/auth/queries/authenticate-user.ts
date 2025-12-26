import { getAdapter } from '../../core/dbal-client'
import { verifyPassword } from '../../password/verify-password'
import type { User } from '../../types/level-types'
import { mapUserRecord } from '../../users/map-user-record'
import { getUserFirstLoginFlag } from '../../users/get-user-first-login-flag'

export interface AuthenticateResult {
  success: boolean
  user: User | null
  error?: 'invalid_credentials' | 'user_not_found' | 'account_locked'
  requiresPasswordChange?: boolean
}

/**
 * Authenticate user by username and password.
 * Returns user data on success, error code on failure.
 * Uses DBAL adapter - never accesses Prisma directly.
 */
export const authenticateUser = async (
  username: string,
  password: string
): Promise<AuthenticateResult> => {
  const adapter = getAdapter()

  // Look up credentials
  const credResult = await adapter.list('Credential', {
    filter: { username },
  })

  if (credResult.data.length === 0) {
    return { success: false, user: null, error: 'invalid_credentials' }
  }

  const credential = credResult.data[0] as { username: string; passwordHash: string }
  const passwordValid = await verifyPassword(password, credential.passwordHash)

  if (!passwordValid) {
    return { success: false, user: null, error: 'invalid_credentials' }
  }

  const userRecord = await adapter.findFirst('User', {
    where: { username },
  })

  if (!userRecord) {
    return { success: false, user: null, error: 'user_not_found' }
  }

  const user = mapUserRecord(userRecord as Record<string, unknown>)
  const requiresPasswordChange = getUserFirstLoginFlag(
    userRecord as Record<string, unknown>
  )

  return { success: true, user, requiresPasswordChange }
}
