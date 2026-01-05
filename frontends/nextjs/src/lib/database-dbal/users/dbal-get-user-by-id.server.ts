/**
 * Get user by ID via DBAL (stub)
 */

import { getAdapter } from '../../dbal-client/adapter/get-adapter'
import type { User } from '../../types/level-types'

export async function dbalGetUserById(id: string): Promise<User | null> {
  const adapter = getAdapter()
  return await adapter.get('User', id) as User | null
}
