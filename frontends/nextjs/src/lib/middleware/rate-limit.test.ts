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

describe('getRateLimitStatus', () => {
  it('reports the documented limit for each endpoint type', () => {
    // These mirror the limits in CLAUDE.md; a change here is a policy change.
    const req = request('status-a')

    expect(getRateLimitStatus(req, 'login').limit).toBe(5)
    expect(getRateLimitStatus(req, 'register').limit).toBe(3)
    expect(getRateLimitStatus(req, 'list').limit).toBe(100)
    expect(getRateLimitStatus(req, 'mutation').limit).toBe(50)
    expect(getRateLimitStatus(req, 'public').limit).toBe(1000)
    expect(getRateLimitStatus(req, 'bootstrap').limit).toBe(1)
  })

  it('starts a fresh caller at zero used, all remaining', () => {
    const status = getRateLimitStatus(request('status-b'), 'mutation')

    expect(status.current).toBe(0)
    expect(status.remaining).toBe(50)
  })

  it('counts requests already made against the remaining allowance', () => {
    const check = limiter(10)
    const req = request('status-c')
    check(req)
    check(req)

    const status = getRateLimitStatus(req, 'mutation')

    expect(status.current).toBe(2)
    expect(status.remaining).toBe(48)
  })

  it('never reports a negative remaining', () => {
    // bootstrap allows 1; two requests must floor at zero, not go to -1.
    const check = limiter(5)
    const req = request('status-d')
    check(req)
    check(req)

    expect(getRateLimitStatus(req, 'bootstrap').remaining).toBe(0)
  })
})
