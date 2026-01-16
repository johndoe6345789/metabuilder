import { getAdapter } from '../../core/dbal-client'
import type { User } from '@/lib/types/level-types'
import { mapUserRecord } from '../map-user-record'

/**
 * Get a user by ID from database
 */
export async function getUserById(
  userId: string,
  options?: { tenantId?: string }
): Promise<User | null> {
  const adapter = getAdapter()
  const record = options?.tenantId !== undefined
    ? await adapter.findFirst('User', { where: { id: userId, tenantId: options.tenantId } })
    : await adapter.read('User', userId)

  if (record === null || record === undefined) return null

  return mapUserRecord(record as Record<string, unknown>)
}
