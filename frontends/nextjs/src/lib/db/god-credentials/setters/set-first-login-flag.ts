import { getAdapter } from '../../core/dbal-client'

/**
 * Set first login flag for a user
 */
export async function setFirstLoginFlag(username: string, isFirstLogin: boolean): Promise<void> {
  const adapter = getAdapter()
  // Find the user first
  const user = await adapter.findFirst('User', {
    where: { username },
  }) as { id: string } | null
  if (user) {
    await adapter.update('User', user.id, { firstLogin: isFirstLogin })
  }
}
