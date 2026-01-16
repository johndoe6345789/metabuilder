import { getAdapter } from '../../../core/dbal-client'
import type { User } from '@/lib/types/level-types'

/**
 * Add a single user
 */
export async function addUser(user: User): Promise<void> {
  const adapter = getAdapter()
  await adapter.create('User', {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    profilePicture: user.profilePicture,
    bio: user.bio,
    createdAt: BigInt(user.createdAt),
    tenantId: user.tenantId,
    isInstanceOwner: user.isInstanceOwner ?? false,
  })
}
