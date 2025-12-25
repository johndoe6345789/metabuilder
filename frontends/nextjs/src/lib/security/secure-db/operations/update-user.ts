import { Database } from '@/lib/db'
import type { User } from '@/lib/types/level-types'
import type { SecurityContext } from '../types'
import { executeQuery } from '../execute-query'
import { sanitizeInput } from '../sanitize-input'

/**
 * Update a user with security checks
 */
export async function updateUser(
  ctx: SecurityContext, 
  userId: string, 
  updates: Partial<User>
): Promise<User> {
  const sanitized = sanitizeInput(updates)
  const tenantId = ctx.user.tenantId

  if (tenantId && sanitized.tenantId && sanitized.tenantId !== tenantId) {
    throw new Error('Access denied. Cannot change user tenant.')
  }
  
  return executeQuery(
    ctx,
    'user',
    'UPDATE',
    async () => {
      if (tenantId) {
        const existing = await Database.getUserById(userId, { tenantId })
        if (!existing) {
          throw new Error('User not found or access denied')
        }
      }

      await Database.updateUser(userId, sanitized)
      const updated = await Database.getUserById(
        userId,
        tenantId ? { tenantId } : undefined
      )
      if (!updated) {
        throw new Error('User not found after update')
      }
      return updated
    },
    userId
  )
}
