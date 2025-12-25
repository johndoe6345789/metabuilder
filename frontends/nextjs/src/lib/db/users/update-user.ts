import { prisma } from '../prisma'
import type { User } from '../level-types'

/**
 * Update a user by ID
 */
export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      username: updates.username,
      email: updates.email,
      role: updates.role,
      profilePicture: updates.profilePicture,
      bio: updates.bio,
      tenantId: updates.tenantId,
      isInstanceOwner: updates.isInstanceOwner,
    },
  })
}
