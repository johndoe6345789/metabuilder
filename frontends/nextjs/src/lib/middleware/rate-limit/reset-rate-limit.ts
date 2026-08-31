import { getGlobalStore } from './store'

/**
 * Reset rate limit for a specific key -- useful for admin operations,
 * e.g. clearing an IP's count after manual verification.
 */
export function resetRateLimit(key: string): void {
  getGlobalStore().reset(key)
}
