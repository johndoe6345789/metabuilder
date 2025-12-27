import { Database } from '@/lib/database-lib/database'
import type { SecurityContext } from '../types'
import { executeQuery } from '../execute-query'

/**
 * Delete a user with security checks
 */
export async function deleteUser(ctx: SecurityContext, userId: string): Promise<void> {
  return executeQuery(
    ctx,
    'user',
    'DELETE',
    async () => {
      const tenantId = ctx.user.tenantId
      if (tenantId) {
        const existing = await Database.getUserById(userId, { tenantId })
        if (!existing) {
          throw new Error('User not found or access denied')
        }
      }

      await Database.deleteUser(userId)
    },
    userId
  )
}
