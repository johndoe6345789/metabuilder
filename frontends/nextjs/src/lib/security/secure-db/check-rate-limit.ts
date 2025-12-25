const RATE_LIMIT_WINDOW = 60000
const MAX_REQUESTS_PER_WINDOW = 100

const rateLimitMap = new Map<string, number[]>()

/**
 * Check if user is within rate limits
 */
export function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userRequests = rateLimitMap.get(userId) || []
  
  const recentRequests = userRequests.filter(
    timestamp => now - timestamp < RATE_LIMIT_WINDOW
  )
  
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false
  }
  
  recentRequests.push(now)
  rateLimitMap.set(userId, recentRequests)
  return true
}

/**
 * Clear rate limit for a user (useful for testing)
 */
export function clearRateLimit(userId: string): void {
  rateLimitMap.delete(userId)
}

/**
 * Clear all rate limits (useful for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitMap.clear()
}
