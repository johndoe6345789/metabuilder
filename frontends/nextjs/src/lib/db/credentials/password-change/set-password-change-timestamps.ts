import { getAdapter } from '../../core/dbal-client'

/**
 * Set password change timestamps for users
 */
export async function setPasswordChangeTimestamps(timestamps: Record<string, number>): Promise<void> {
  const adapter = getAdapter()
  for (const [username, timestamp] of Object.entries(timestamps)) {
    const users = await adapter.list('User', { filter: { username } })
    if (users.data.length > 0) {
      const user = users.data[0] as any
      await adapter.update('User', user.id, { passwordChangeTimestamp: BigInt(timestamp) })
    }
  }
}
