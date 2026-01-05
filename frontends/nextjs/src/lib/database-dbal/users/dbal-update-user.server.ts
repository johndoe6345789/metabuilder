/**
 * Update user via DBAL (stub)
 */

import { getAdapter } from '../../dbal-client/adapter/get-adapter'
import type { User } from '../../types/level-types'

export async function dbalUpdateUser(id: string, data: Partial<User>): Promise<User> {
  const adapter = getAdapter()
  return await adapter.update('User', id, data) as User
}
