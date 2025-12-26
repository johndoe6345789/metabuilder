import { getAdapter } from '../../core/dbal-client'
import type { User } from '../../types/level-types'
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
      ...(options?.tenantId ? { tenantId: options.tenantId } : {}),
    },
  })

  if (!record) {
    return null
  }

  return mapUserRecord(record as Record<string, unknown>)
}
