import type { NextRequest } from 'next/server'
import { getGlobalStore } from './store'
import { getClientIp } from './client-ip'

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

function tooManyRequestsResponse(windowMs: number): Response {
  const retryAfter = Math.ceil(windowMs / 1000)
  return new Response(
    JSON.stringify({ error: 'Too many requests', retryAfter }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
      },
    }
  )
}

/**
 * Create a rate limiter for a specific endpoint pattern.
 *
 * ```typescript
 * const loginLimiter = createRateLimiter({ limit: 5, window: 60 * 1000 })
 * export async function POST(request: NextRequest) {
 *   const limitResponse = loginLimiter(request)
 *   if (limitResponse) return limitResponse
 *   // ... rest of handler
 * }
 * ```
 */
export function createRateLimiter(config: RateLimitConfig) {
  const store = getGlobalStore()
  const keyGenerator = config.keyGenerator ?? getClientIp

  return function checkRateLimit(request: NextRequest): Response | null {
    const key = keyGenerator(request)
    const count = store.increment(key, config.window)

    if (count > config.limit) {
      return config.onLimitExceeded?.(key, request) ??
        tooManyRequestsResponse(config.window)
    }

    return null
  }
}
