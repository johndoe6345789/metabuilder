import type { NextRequest } from 'next/server'
import { getGlobalStore } from './store'
import { getClientIp } from './client-ip'
import { RATE_LIMIT_CONFIGS, type RateLimitEndpoint } from './configs'

export interface RateLimitStatus {
  current: number
  limit: number
  remaining: number
}

/** Current rate limit status for a caller, for debugging or an
 *  admin-facing display -- reads the same RATE_LIMIT_CONFIGS the real
 *  limiter enforces, so this can never report a stale limit. */
export function getRateLimitStatus(
  request: NextRequest,
  endpointType: RateLimitEndpoint
): RateLimitStatus {
  const key = getClientIp(request)
  const current = getGlobalStore().get(key)
  const limit = RATE_LIMIT_CONFIGS[endpointType].limit

  return { current, limit, remaining: Math.max(0, limit - current) }
}
