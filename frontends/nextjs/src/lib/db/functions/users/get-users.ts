import { prisma } from '../../prisma'
import type { User } from '../../../types/level-types'

/**
 * Get all users from database
 * @returns Array of users
 */
export const getUsers = async (): Promise<User[]> => {
  const users = await prisma.user.findMany()
  return users.map(u => ({
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
