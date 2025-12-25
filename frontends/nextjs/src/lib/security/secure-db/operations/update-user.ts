import { prisma } from '../../db/prisma'
import type { User } from '../../types/level-types'
import type { SecurityContext } from './types'
import { executeQuery } from './execute-query'
import { sanitizeInput } from './sanitize-input'

/**
 * Update a user with security checks
 */
export async function updateUser(
  ctx: SecurityContext, 
  userId: string, 
  updates: Partial<User>
): Promise<User> {
  const sanitized = sanitizeInput(updates)
  
  return executeQuery(
    ctx,
    'user',
    'UPDATE',
    async () => {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          username: sanitized.username,
          email: sanitized.email,
          role: sanitized.role,
          profilePicture: sanitized.profilePicture,
          bio: sanitized.bio,
          tenantId: sanitized.tenantId,
        },
      })
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
