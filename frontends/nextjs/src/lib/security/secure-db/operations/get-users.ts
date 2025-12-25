import { prisma } from '../../db/prisma'
import type { User } from '../../types/level-types'
import type { SecurityContext } from './types'
import { executeQuery } from './execute-query'

/**
 * Get all users with security checks
 */
export async function getUsers(ctx: SecurityContext): Promise<User[]> {
  return executeQuery(
    ctx,
    'user',
    'READ',
    async () => {
      const users = await prisma.user.findMany()
      return users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role as User['role'],
        profilePicture: u.profilePicture || undefined,
        bio: u.bio || undefined,
        createdAt: Number(u.createdAt),
        tenantId: u.tenantId || undefined,
        isInstanceOwner: u.isInstanceOwner,
      }))
    },
    'all_users'
  )
}
