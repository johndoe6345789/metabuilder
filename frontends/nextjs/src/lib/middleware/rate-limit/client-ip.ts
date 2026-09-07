import type { NextRequest } from 'next/server'

/**
 * Who to count a request against.
 *
 * This picks the rate limiter's bucket, so any header the caller can set
 * for themselves is a way out of the limit entirely -- and the tightest
 * limit here is five login attempts a minute. This used to read the FIRST
 * X-Forwarded-For entry, which is whatever the caller sent: rotating it
 * handed out a fresh bucket per request, so the login limiter counted to
 * one and never further.
 *
 * The proxy in front of this app sets `X-Real-IP` to `$remote_addr` and
 * appends to `X-Forwarded-For` via `$proxy_add_x_forwarded_for`, so the
 * trustworthy value is the one the proxy wrote: X-Real-IP, or the LAST
 * entry of the forwarded chain. Everything to its left came from the
 * caller.
 *
 * With no proxy at all every caller shares the "unknown" bucket. That
 * over-limits rather than under-limits, which is the safe direction.
 */
export function getClientIp(request: NextRequest): string {
  // Trustworthy only where something upstream really is CloudFlare and
  // strips the header otherwise; nothing here does, so it is opt-in.
  if (process.env.RATE_LIMIT_TRUST_CF_HEADER === 'true') {
    const cfIp = request.headers.get('cf-connecting-ip')
    if (cfIp !== null && cfIp.trim() !== '') return cfIp.trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp !== null && realIp.trim() !== '') return realIp.trim()

  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded !== null) {
    const appended = forwarded.split(',').at(-1)
    if (appended !== undefined && appended.trim() !== '') {
      return appended.trim()
    }
  }

  return 'unknown'
}
