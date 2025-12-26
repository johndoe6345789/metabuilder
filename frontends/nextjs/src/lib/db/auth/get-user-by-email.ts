import { getAdapter } from '../dbal-client'
import type { User } from '../../types/level-types'

/**
 * Get user by email from DBAL.
 * Single-responsibility lambda for email lookup.
 */
export const getUserByEmail = async (
  email: string,
  options?: { tenantId?: string }
): Promise<User | null> => {
  const adapter = getAdapter()

  const record = await adapter.findFirst('User', {
    where: {
      email,
      ...(options?.tenantId ? { tenantId: options.tenantId } : {}),
    },
  })

  if (!record) {
    return null
  }

  const userData = record as Record<string, unknown>

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
