import { Database } from '@/lib/database-lib/database'
import type { User } from '@/lib/types/level-types'
import type { SecurityContext } from '../types'
import { executeQuery } from '../execute-query'

/**
 * Get a user by ID with security checks
 */
export async function getUserById(ctx: SecurityContext, userId: string): Promise<User | null> {
  return executeQuery(
    ctx,
    'user',
    'READ',
    async () =>
      Database.getUserById(
        userId,
        ctx.user.tenantId ? { tenantId: ctx.user.tenantId } : undefined
      ),
    userId
  )
}
