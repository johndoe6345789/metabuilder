export { setUsers } from './set-users'
import { getAdapter } from '../core/dbal-client'
import type { User } from '../../types/level-types'

/**
 * Set all users (replaces existing)
 * Note: Uses sequential operations - for atomic transactions use prisma directly
 */
export async function setUsers(users: User[]): Promise<void> {
  const adapter = getAdapter()
  
  // Get existing users and delete them
  const existing = await adapter.list('User')
  for (const user of existing.data as any[]) {
    await adapter.delete('User', user.id)
  }
  
  // Create new users
  for (const user of users) {
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
}
