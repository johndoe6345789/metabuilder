/**
 * Get users via DBAL (stub)
 */

import { getAdapter } from '../../dbal-client/adapter/get-adapter'
import type { User } from '../../types/level-types'
import type { ListOptions, ListResult } from '../../dbal-client/types'

export async function dbalGetUsers(options?: ListOptions): Promise<ListResult<User>> {
  const adapter = getAdapter()
  return await adapter.list('User', options) as ListResult<User>
}
