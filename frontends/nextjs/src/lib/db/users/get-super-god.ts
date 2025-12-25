import { getAdapter } from '../dbal-client'
import type { User } from '../../types/level-types'

/**
 * Get the SuperGod user (instance owner)
 */
export async function getSuperGod(): Promise<User | null> {
  const adapter = getAdapter()
  const result = await adapter.list('User', { filter: { isInstanceOwner: true } })

  if (result.data.length === 0) return null
  const user = result.data[0] as any

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
