import { getAdapter } from '../../core/dbal-client'
import type { User } from '@/lib/level-types'
import { mapUserRecord } from '../map-user-record'

export type GetUsersOptions = { tenantId: string } | { scope: 'all' }

/**
 * Get users from database.
 * Requires explicit scope to avoid accidental cross-tenant access.
 */
export async function getUsers(options: GetUsersOptions): Promise<User[]> {
  const adapter = getAdapter()
  const listOptions = 'tenantId' in options ? { filter: { tenantId: options.tenantId } } : undefined
  const result = listOptions ? await adapter.list('User', listOptions) : await adapter.list('User')
  return (result.data as Record<string, unknown>[]).map(user => mapUserRecord(user))
}
