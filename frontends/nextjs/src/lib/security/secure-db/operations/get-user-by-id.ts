import { prisma } from '../../db/prisma'
import type { User } from '../../types/level-types'
import type { SecurityContext } from './types'
import { executeQuery } from './execute-query'

/**
 * Get a user by ID with security checks
 */
export async function getUserById(ctx: SecurityContext, userId: string): Promise<User | null> {
  return executeQuery(
    ctx,
    'user',
    'READ',
    async () => {
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user) return null
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role as User['role'],
        profilePicture: user.profilePicture || undefined,
        bio: user.bio || undefined,
        createdAt: Number(user.createdAt),
        tenantId: user.tenantId || undefined,
        isInstanceOwner: user.isInstanceOwner,
      }
    },
    userId
  )
}
