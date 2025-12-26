import { getRateLimitConfig, rateLimitMap } from './rate-limit-store'

/**
 * Check if user is within rate limits
 */
export function checkRateLimit(userId: string): boolean {
  const { windowMs, maxRequests } = getRateLimitConfig()
  const now = Date.now()
  const userRequests = rateLimitMap.get(userId) || []
  
  const recentRequests = userRequests.filter(
    timestamp => now - timestamp < windowMs
  )
  
  if (recentRequests.length >= maxRequests) {
    return false
  }
  
  recentRequests.push(now)
  rateLimitMap.set(userId, recentRequests)
  return true
}
