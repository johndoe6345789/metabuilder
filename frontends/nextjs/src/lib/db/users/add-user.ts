import { prisma } from '../prisma'
import type { User } from '../level-types'

/**
 * Add a single user
 */
export async function addUser(user: User): Promise<void> {
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
      isInstanceOwner: user.isInstanceOwner ?? false,
    },
  })
}
