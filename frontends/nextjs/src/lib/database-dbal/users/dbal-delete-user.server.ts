/**
 * Delete user via DBAL (stub)
 */

import { getAdapter } from '../../dbal-client/adapter/get-adapter'

export async function dbalDeleteUser(id: string): Promise<void> {
  const adapter = getAdapter()
  await adapter.delete('User', id)
}
