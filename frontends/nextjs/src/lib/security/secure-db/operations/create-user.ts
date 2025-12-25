import { prisma } from '../../db/prisma'
import type { User } from '../../types/level-types'
import type { SecurityContext } from './types'
import { executeQuery } from './execute-query'
import { sanitizeInput } from './sanitize-input'

/**
 * Create a new user with security checks
 */
export async function createUser(
  ctx: SecurityContext, 
  userData: Omit<User, 'id' | 'createdAt'>
): Promise<User> {
  const sanitized = sanitizeInput(userData)
  
  return executeQuery(
    ctx,
    'user',
    'CREATE',
    async () => {
      const user = await prisma.user.create({
        data: {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          username: sanitized.username,
          email: sanitized.email,
          role: sanitized.role,
          profilePicture: sanitized.profilePicture,
          bio: sanitized.bio,
          createdAt: BigInt(Date.now()),
          tenantId: sanitized.tenantId,
          isInstanceOwner: sanitized.isInstanceOwner || false,
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
    'new_user'
  )
}
