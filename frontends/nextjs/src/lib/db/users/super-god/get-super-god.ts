import { getAdapter } from '../../core/dbal-client'
import type { User } from '@/lib/level-types'
import { mapUserRecord } from '../map-user-record'

/**
 * Get the SuperGod user (instance owner)
 */
export async function getSuperGod(): Promise<User | null> {
  const adapter = getAdapter()
  const result = await adapter.list('User', { filter: { isInstanceOwner: true } })

  if (result.data.length === 0) return null
  return mapUserRecord(result.data[0] as Record<string, unknown>)
}
