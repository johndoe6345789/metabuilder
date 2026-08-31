import type { NextRequest } from 'next/server'
import { rateLimiters } from './rate-limiters'
import type { RateLimitEndpoint } from './configs'

/**
 * Apply rate limiting to a NextRequest for one endpoint type. Returns an
 * error response if the limit is exceeded, otherwise null.
 *
 * ```typescript
 * const limitResponse = applyRateLimit(request, 'login')
 * if (limitResponse) return limitResponse
 * ```
 */
export function applyRateLimit(
  request: NextRequest,
  endpointType: RateLimitEndpoint
): Response | null {
  return rateLimiters[endpointType](request)
}
