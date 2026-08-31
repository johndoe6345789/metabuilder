import type { NextRequest } from 'next/server'

/** Extract the caller's IP from a NextRequest, allowing for a proxy in
 *  front (CloudFlare, then X-Forwarded-For, then X-Real-IP). */
export function getClientIp(request: NextRequest): string {
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp !== null) return cfIp

  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded !== null) {
    const firstIp = forwarded.split(',')[0]
    if (firstIp !== undefined) return firstIp.trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp !== null) return realIp

  return 'unknown'
}
