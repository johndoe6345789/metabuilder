import { prisma } from '../prisma'
import type { User } from '../level-types'

/**
 * Set all users (replaces existing)
 */
export async function setUsers(users: User[]): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.user.deleteMany()
    for (const user of users) {
      await tx.user.create({
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
  })
}
