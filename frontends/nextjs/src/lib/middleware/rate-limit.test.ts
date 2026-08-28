import { afterEach, describe, expect, it } from 'vitest'

import {
  createRateLimiter,
  getRateLimitStatus,
  resetRateLimit,
} from '@/lib/middleware/rate-limit'

const keys: string[] = []
const request = (key: string) => {
  keys.push(key)
  return { headers: new Headers({ 'x-forwarded-for': key }) } as never
}

afterEach(() => {
  keys.splice(0).forEach(resetRateLimit)
})

const limiter = (limit: number) =>
  createRateLimiter({
    limit,
    window: 60_000,
    keyGenerator: (r: never) =>
      (r as { headers: Headers }).headers.get('x-forwarded-for') ?? 'anon',
  })

describe('createRateLimiter', () => {
  it('lets requests through up to the limit', () => {
    const check = limiter(3)
    const req = request('a')

    expect(check(req)).toBeNull()
    expect(check(req)).toBeNull()
    expect(check(req)).toBeNull()
  })

  it('refuses the request after the limit with a 429', () => {
    const check = limiter(1)
    const req = request('b')
    check(req)

    const refused = check(req)

    expect(refused?.status).toBe(429)
  })

  it('tells the caller how long to wait, in seconds', async () => {
    const check = limiter(1)
    const req = request('c')
    check(req)
    const refused = check(req)

    // Retry-After is seconds, not the milliseconds the window is measured in.
    expect(refused?.headers.get('Retry-After')).toBe('60')
    await expect(refused?.json()).resolves.toMatchObject({ retryAfter: 60 })
  })

  it('counts each key separately, so one caller cannot block another', () => {
    const check = limiter(1)
    check(request('d'))

    expect(check(request('e'))).toBeNull()
  })

  it('uses a custom response when one is supplied', () => {
    const check = createRateLimiter({
      limit: 1,
      window: 1000,
      keyGenerator: () => 'f',
      onLimitExceeded: () => new Response('slow down', { status: 503 }),
    })
    keys.push('f')
    check(request('f'))

    expect(check(request('f'))?.status).toBe(503)
  })
})

describe('resetRateLimit', () => {
  it('clears a key so the caller starts fresh', () => {
    const check = limiter(1)
    check(request('g'))
    resetRateLimit('g')

    expect(check(request('g'))).toBeNull()
  })
})
