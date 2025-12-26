import { Database } from '@/lib/db'
import type { User } from '@/lib/types/level-types'
import type { SecurityContext } from '../types'
import { executeQuery } from '../execute-query'
import { sanitizeInput } from '../sanitize-input'

/**
 * Create a new user with security checks
 */
export async function createUser(
  ctx: SecurityContext, 
  userData: Omit<User, 'id' | 'createdAt'>
): Promise<User> {
  const sanitized = sanitizeInput(userData)
  const tenantId = ctx.user.tenantId

  if (tenantId && sanitized.tenantId && sanitized.tenantId !== tenantId) {
    throw new Error('Access denied. Cannot assign user to another tenant.')
  }

  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    username: sanitized.username,
    email: sanitized.email,
    role: sanitized.role,
    profilePicture: sanitized.profilePicture,
    bio: sanitized.bio,
    createdAt: Date.now(),
    tenantId: tenantId ?? sanitized.tenantId,
    isInstanceOwner: sanitized.isInstanceOwner ?? false,
  }
  
  return executeQuery(
    ctx,
    'user',
    'CREATE',
    async () => {
      await Database.addUser(newUser)
      return newUser
    },
    'new_user'
  )
}
