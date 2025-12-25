import { getAdapter } from '../dbal-client'
import type { User } from '../../types/level-types'

/**
 * Get a user by ID from database
 */
export async function getUserById(
  userId: string,
  options?: { tenantId?: string }
): Promise<User | null> {
  const adapter = getAdapter()
  const record = options?.tenantId
    ? await adapter.findFirst('User', { where: { id: userId, tenantId: options.tenantId } })
    : await adapter.read('User', userId)

  if (!record) return null

  const user = record as any
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role as any,
    profilePicture: user.profilePicture || undefined,
    bio: user.bio || undefined,
    createdAt: Number(user.createdAt),
    tenantId: user.tenantId || undefined,
    isInstanceOwner: user.isInstanceOwner,
  }
}
