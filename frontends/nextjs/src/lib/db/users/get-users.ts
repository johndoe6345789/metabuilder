import { prisma } from '../prisma'
import type { User } from '../level-types'

/**
 * Get all users from database
 */
export async function getUsers(): Promise<User[]> {
  const users = await prisma.user.findMany()
  return users.map((u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role as any,
    profilePicture: u.profilePicture || undefined,
    bio: u.bio || undefined,
    createdAt: Number(u.createdAt),
    tenantId: u.tenantId || undefined,
    isInstanceOwner: u.isInstanceOwner,
  }))
}
