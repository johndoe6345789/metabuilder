import { rateLimitMap } from './store/rate-limit-store'

/**
 * Clear rate limit for a user (useful for testing)
 */
export function clearRateLimit(userId: string): void {
  rateLimitMap.delete(userId)
}
