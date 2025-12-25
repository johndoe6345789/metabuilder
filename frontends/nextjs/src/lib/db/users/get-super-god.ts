import { prisma } from '../prisma'
import type { User } from '../level-types'

/**
 * Get the SuperGod user (instance owner)
 */
export async function getSuperGod(): Promise<User | null> {
  const user = await prisma.user.findFirst({
    where: { isInstanceOwner: true },
  })

  if (!user) return null

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
