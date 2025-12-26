import { getAdapter } from '../dbal-client'
import type { User } from '../../types/level-types'

/**
 * Get user by email from DBAL.
 * Single-responsibility lambda for email lookup.
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const adapter = getAdapter()

  const result = await adapter.list('User', {
    filter: { email },
  })

  if (result.data.length === 0) {
    return null
  }

  const userData = result.data[0] as Record<string, unknown>

  return {
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
}
