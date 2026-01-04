import { getAdapter } from '../../core/dbal-client'
import type { User } from '@/lib/level-types'

/**
 * Update a user by ID
 */
export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  const adapter = getAdapter()
  await adapter.update('User', userId, {
    username: updates.username,
    email: updates.email,
    role: updates.role,
    profilePicture: updates.profilePicture,
    bio: updates.bio,
    tenantId: updates.tenantId,
    isInstanceOwner: updates.isInstanceOwner,
  })
}
