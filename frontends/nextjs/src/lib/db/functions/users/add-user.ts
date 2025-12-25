import { prisma } from '../../prisma'
import type { User } from '../../../types/level-types'

/**
 * Add a single user
 * @param user - The user to add
 */
export const addUser = async (user: User): Promise<void> => {
  await prisma.user.create({
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      bio: user.bio,
      createdAt: BigInt(user.createdAt),
      tenantId: user.tenantId,
      isInstanceOwner: user.isInstanceOwner || false,
      passwordChangeTimestamp: null,
      firstLogin: false,
    },
  })
}
