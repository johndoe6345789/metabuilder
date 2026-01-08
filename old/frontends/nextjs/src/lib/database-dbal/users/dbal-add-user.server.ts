/**
 * Add user via DBAL (stub)
 */

import { getAdapter } from '../../dbal-client/adapter/get-adapter'
import type { User } from '../../types/level-types'

export async function dbalAddUser(user: User): Promise<void> {
  const adapter = getAdapter()
  await adapter.create('User', user as unknown as Record<string, unknown>)
}
