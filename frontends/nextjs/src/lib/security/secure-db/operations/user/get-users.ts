import { Database } from '@/lib/database-lib/database'
import type { User } from '@/lib/types/level-types'
import type { SecurityContext } from '../types'
import { executeQuery } from '../execute-query'

/**
 * Get all users with security checks
 */
export async function getUsers(ctx: SecurityContext): Promise<User[]> {
  return executeQuery(
    ctx,
    'user',
    'READ',
    async () =>
      Database.getUsers(ctx.user.tenantId ? { tenantId: ctx.user.tenantId } : { scope: 'all' }),
    'all_users'
  )
}
