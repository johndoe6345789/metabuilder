import { getAdapter } from '../../core/dbal-client'

/**
 * Delete a user by ID
 */
export async function deleteUser(userId: string): Promise<void> {
  const adapter = getAdapter()
  await adapter.delete('User', userId)
}
