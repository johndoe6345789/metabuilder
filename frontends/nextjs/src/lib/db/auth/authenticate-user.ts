import { getAdapter } from '../dbal-client'
import { verifyPassword } from '../verify-password'
import type { User } from '../../types/level-types'

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

  // Fetch user data
  const userResult = await adapter.list('User', {
    filter: { username },
  })

  if (userResult.data.length === 0) {
    return { success: false, user: null, error: 'user_not_found' }
  }

  const userData = userResult.data[0] as Record<string, unknown>

  const user: User = {
    id: String(userData.id),
    username: String(userData.username),
    email: String(userData.email),
    role: userData.role as User['role'],
    profilePicture: userData.profilePicture ? String(userData.profilePicture) : undefined,
    bio: userData.bio ? String(userData.bio) : undefined,
    createdAt: Number(userData.createdAt),
    tenantId: userData.tenantId ? String(userData.tenantId) : undefined,
    isInstanceOwner: Boolean(userData.isInstanceOwner),
  }

  // Check first login flag
  const firstLoginResult = await adapter.findFirst('GodCredentialExpiry', {
    where: { settingKey: `first_login_${username}` },
  })

  const requiresPasswordChange = firstLoginResult
    ? (firstLoginResult as { value: string }).value === 'true'
    : false

  return { success: true, user, requiresPasswordChange }
}
