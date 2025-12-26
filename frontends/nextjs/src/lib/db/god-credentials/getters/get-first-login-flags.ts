import { getAdapter } from '../../core/dbal-client'
import { getUserFirstLoginFlag } from '../users/get-user-first-login-flag'

/**
 * Get first login flags for all users
 */
export async function getFirstLoginFlags(): Promise<Record<string, boolean>> {
  const adapter = getAdapter()
  const result = await adapter.list('User')
  const users = result.data as any[]
  const flags: Record<string, boolean> = {}
  for (const user of users) {
    flags[user.username] = getUserFirstLoginFlag(user)
  }
  return flags
}
