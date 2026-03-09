/**
 * Rate Limiting Middleware for MetaBuilder
 *
 * Implements sliding window rate limiting to prevent:
 * - Brute-force attacks on login endpoint
 * - User enumeration attacks
 * - DoS attacks on public endpoints
 *
 * Storage: In-memory (single process) or Redis (distributed)
 * For production with multiple instances, use Redis adapter
 */

import type { NextRequest } from 'next/server'

export interface RateLimitConfig {
  /** Number of requests allowed */
  limit: number
  /** Time window in milliseconds */
  window: number
  /** Optional key generator (default: IP address) */
  keyGenerator?: (request: NextRequest) => string
  /** Optional error response customizer */
  onLimitExceeded?: (key: string, request: NextRequest) => Response
}

export interface RateLimitStore {
  /** Get current count for key */
  get(key: string): number
  /** Increment count for key */
  increment(key: string, window: number): number
  /** Reset count for key */
  reset(key: string): void
}

/**
 * In-memory rate limit store (suitable for development and single-instance deployments)
 *
 * ⚠️ Not suitable for distributed systems - use Redis adapter for production multi-instance
 */
class InMemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetAt: number }>()
  private cleanup: ReturnType<typeof setInterval> | null = null

  constructor() {
    // Clean up expired entries every 60 seconds
    this.cleanup = setInterval(() => {
      const now = Date.now()
      for (const [key, { resetAt }] of this.store.entries()) {
        if (resetAt < now) {
          this.store.delete(key)
        }
      }
    }, 60000)
  }

  get(key: string): number {
    const entry = this.store.get(key)
    if (!entry) return 0
    if (entry.resetAt < Date.now()) {
      this.store.delete(key)
      return 0
    }
    return entry.count
  }

  increment(key: string, window: number): number {
    const now = Date.now()
    const entry = this.store.get(key)

    if (!entry || entry.resetAt < now) {
      // Create new window
      const newEntry = { count: 1, resetAt: now + window }
      this.store.set(key, newEntry)
      return 1
    }

    // Increment existing window
    entry.count++
    return entry.count
  }

  reset(key: string): void {
    this.store.delete(key)
  }

  cleanup_dispose(): void {
    if (this.cleanup) clearInterval(this.cleanup)
    this.store.clear()
  }
}

// Global store instance
let globalStore: InMemoryRateLimitStore | null = null

function getGlobalStore(): InMemoryRateLimitStore {
  if (!globalStore) {
    globalStore = new InMemoryRateLimitStore()
  }
  return globalStore
}

/**
 * Extract IP address from NextRequest
 * Works with proxies (X-Forwarded-For, CF-Connecting-IP headers)
 */
function getClientIp(request: NextRequest): string {
  // Try CloudFlare header first
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp

  // Try X-Forwarded-For (supports multiple IPs, take first)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const firstIp = forwarded.split(',')[0]
    if (firstIp) return firstIp.trim()
  }

  // Fall back to X-Real-IP
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp

  // Fall back to connection remote address (localhost in dev)
  return 'unknown'
}

/**
 * Create a rate limiter for a specific endpoint pattern
 *
 * Example usage in API route:
 * ```typescript
 * const loginLimiter = createRateLimiter({ limit: 5, window: 60 * 1000 })
 *
 * export async function POST(request: NextRequest) {
 *   const limitResponse = loginLimiter(request)
 *   if (limitResponse) return limitResponse
 *
 *   // ... rest of handler
 * }
 * ```
 */
export function createRateLimiter(config: RateLimitConfig) {
  const store = getGlobalStore()
  const keyGenerator = config.keyGenerator || ((req) => getClientIp(req))

  return function checkRateLimit(request: NextRequest): Response | null {
    const key = keyGenerator(request)
    const count = store.increment(key, config.window)

    if (count > config.limit) {
      if (config.onLimitExceeded) {
        return config.onLimitExceeded(key, request)
      }

      // Default rate limit exceeded response
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          retryAfter: Math.ceil(config.window / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(config.window / 1000).toString(),
          },
        }
      )
    }

    return null
  }
}

/**
 * Per-endpoint rate limiters with sensible defaults
 */
export const rateLimiters = {
  /**
   * Login endpoint: 5 attempts per minute per IP
   * Prevents brute-force attacks
   */
  login: createRateLimiter({
    limit: 5,
    window: 60 * 1000, // 1 minute
  }),

  /**
   * Register endpoint: 3 attempts per minute per IP
   * Stricter than login to prevent account enumeration
   */
  register: createRateLimiter({
    limit: 3,
    window: 60 * 1000, // 1 minute
  }),

  /**
   * List endpoints: 100 requests per minute per IP
   * Allows reasonable listing while preventing scraping
   */
  list: createRateLimiter({
    limit: 100,
    window: 60 * 1000, // 1 minute
  }),

  /**
   * Mutation endpoints (create/update/delete): 50 requests per minute per IP
   * Moderate limit to prevent bulk operations while allowing normal workflow
   */
  mutation: createRateLimiter({
    limit: 50,
    window: 60 * 1000, // 1 minute
  }),

  /**
   * Public API endpoints: 1000 requests per hour per IP
   * Generous limit for public access
   */
  public: createRateLimiter({
    limit: 1000,
    window: 60 * 60 * 1000, // 1 hour
  }),

  /**
   * Bootstrap endpoint: 1 attempt per hour per IP
   * Prevents system initialization spam
   */
  bootstrap: createRateLimiter({
    limit: 1,
    window: 60 * 60 * 1000, // 1 hour
  }),
}

/**
 * Middleware to apply rate limiting to a NextRequest
 * Returns error response if limit exceeded, otherwise null
 *
 * Example:
 * ```typescript
 * const limitResponse = applyRateLimit(request, 'login')
 * if (limitResponse) return limitResponse
 * ```
 */
export function applyRateLimit(
  request: NextRequest,
  endpointType: keyof typeof rateLimiters
): Response | null {
  const limiter = rateLimiters[endpointType]
  return limiter(request)
}

/**
 * Custom rate limiter for advanced scenarios
 *
 * Example: Rate limit per user instead of IP
 * ```typescript
 * const userLimiter = createRateLimiter({
 *   limit: 100,
 *   window: 60 * 1000,
 *   keyGenerator: (req) => {
 *     const userId = extractUserIdFromRequest(req)
 *     return `user:${userId}`
 *   }
 * })
 * ```
 */
export { createRateLimiter as createCustomRateLimiter }

/**
 * Reset rate limit for a specific key (useful for admin operations)
 *
 * Example: Reset rate limit for an IP after manual verification
 * ```typescript
 * resetRateLimit(getClientIp(request))
 * ```
 */
export function resetRateLimit(key: string): void {
  getGlobalStore().reset(key)
}

/**
 * Get current rate limit status for debugging
 * Returns remaining requests or -1 if no limit set
 */
export function getRateLimitStatus(
  request: NextRequest,
  endpointType: keyof typeof rateLimiters
): { current: number; limit: number; remaining: number } {
  const config = {
    login: rateLimiters.login as any,
    register: rateLimiters.register as any,
    list: rateLimiters.list as any,
    mutation: rateLimiters.mutation as any,
    public: rateLimiters.public as any,
    bootstrap: rateLimiters.bootstrap as any,
  }

  const _limiter = config[endpointType]
  const key = getClientIp(request)
  const store = getGlobalStore()
  const current = store.get(key)
  const limit = {
    login: 5,
    register: 3,
    list: 100,
    mutation: 50,
    public: 1000,
    bootstrap: 1,
  }[endpointType]

  return {
    current,
    limit,
    remaining: Math.max(0, limit - current),
  }
}
