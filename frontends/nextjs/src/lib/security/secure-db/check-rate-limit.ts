import { RATE_LIMIT_WINDOW, MAX_REQUESTS_PER_WINDOW, rateLimitMap } from './rate-limit-store'

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
