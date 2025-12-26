import { getAdapter } from '../dbal-client'

/**
 * Get password change timestamps for all users
 */
export async function getPasswordChangeTimestamps(): Promise<Record<string, number>> {
  const adapter = getAdapter()
  const result = await adapter.list('User')
  const timestamps: Record<string, number> = {}
  for (const user of result.data as any[]) {
    if (user.passwordChangeTimestamp) {
      timestamps[user.username] = Number(user.passwordChangeTimestamp)
    }
  }
  return timestamps
}
