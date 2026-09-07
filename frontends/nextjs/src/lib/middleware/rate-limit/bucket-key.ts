import type { NextRequest } from 'next/server'

import { getClientIp } from './client-ip'

/**
 * The store entry a request counts against.
 *
 * The endpoint is part of it. Every limiter used to increment the same
 * entry keyed on the address alone, so their counts ran together: fifty
 * mixed calls from one founder exhausted `mutation`'s allowance through
 * `list`'s traffic, and whichever limiter reached the entry first fixed
 * its reset time -- so one `public` or `bootstrap` call, whose windows are
 * an hour, pinned everything open for an hour.
 */
export function rateLimitKey(endpoint: string, request: NextRequest): string {
  return `${endpoint}:${getClientIp(request)}`
}
