import { getAdapter } from '../../core/dbal-client'
import type { User } from '@/lib/types/level-types'
import { mapUserRecord } from '../../users/map-user-record'

/**
 * Get user by username from DBAL.
 * Single-responsibility lambda for username lookup.
 */
export const getUserByUsername = async (
  username: string,
  options?: { tenantId?: string }
): Promise<User | null> => {
  const adapter = getAdapter()

  const record = await adapter.findFirst('User', {
    where: {
      username,
      ...(options?.tenantId !== null && options?.tenantId !== undefined ? { tenantId: options.tenantId } : {}),
    },
  })

  if (record === null || record === undefined) {
    return null
  }

  return mapUserRecord(record as Record<string, unknown>)
}
