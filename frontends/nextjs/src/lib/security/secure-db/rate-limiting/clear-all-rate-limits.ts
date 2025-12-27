import { rateLimitMap } from './store/rate-limit-store'

/**
 * Clear all rate limits (useful for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitMap.clear()
}
