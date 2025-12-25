import { getAdapter } from '../dbal-client'

/**
 * Get first login flags for all users
 */
export async function getFirstLoginFlags(): Promise<Record<string, boolean>> {
  const adapter = getAdapter()
  const result = await adapter.list('User')
  const users = result.data as any[]
  const flags: Record<string, boolean> = {}
  for (const user of users) {
    flags[user.username] = user.firstLogin ?? true
  }
  return flags
}
