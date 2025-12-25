import { prisma } from '../../prisma'
import type { User } from '../../../types/level-types'

/**
 * Set all users (replaces existing)
 * @param users - Array of users to set
 */
export const setUsers = async (users: User[]): Promise<void> => {
  await prisma.user.deleteMany()
  for (const user of users) {
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
}
