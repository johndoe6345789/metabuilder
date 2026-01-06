import { getAdapter } from '../../core/dbal-client'
import type { User } from '@/lib/types/level-types'
import { mapUserRecord } from '../../users/map-user-record'

/**
 * Get user by email from DBAL.
 * Single-responsibility lambda for email lookup.
 */
export const getUserByEmail = async (
  email: string,
  options?: { tenantId?: string }
): Promise<User | null> => {
  const adapter = getAdapter()

  const record = await adapter.findFirst('User', {
    where: {
      email,
      ...(options?.tenantId !== null && options?.tenantId !== undefined ? { tenantId: options.tenantId } : {}),
    },
  })

  if (record === null || record === undefined) {
    return null
  }

  return mapUserRecord(record as Record<string, unknown>)
}
