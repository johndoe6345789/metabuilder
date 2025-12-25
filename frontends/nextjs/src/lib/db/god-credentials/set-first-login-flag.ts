import { getAdapter } from '../dbal-client'

/**
 * Set first login flag for a user
 */
export async function setFirstLoginFlag(username: string, isFirstLogin: boolean): Promise<void> {
  const adapter = getAdapter()
  // Find the user first
  const user = await adapter.findFirst('User', {
    where: { username },
  })
  if (user) {
    await adapter.update('User', user.id, { firstLogin: isFirstLogin })
  }
}
