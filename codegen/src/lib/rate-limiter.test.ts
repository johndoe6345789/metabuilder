import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RateLimiter } from './rate-limiter'

describe('RateLimiter.throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns null when the window is saturated for medium priority', async () => {
    const limiter = new RateLimiter({
      maxRequests: 1,
      windowMs: 1000,
      retryDelay: 10,
      maxRetries: 2
    })
    const fn = vi.fn(async () => 'ok')

    await limiter.throttle('key', fn, 'medium')
    const result = await limiter.throttle('key', fn, 'medium')

    expect(result).toBeNull()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('bounds high-priority retries without recursion when the window is saturated', async () => {
    const limiter = new RateLimiter({
      maxRequests: 1,
      windowMs: 1000,
      retryDelay: 10,
      maxRetries: 3
    })
    const fn = vi.fn(async () => 'ok')

    await limiter.throttle('key', fn, 'high')

    const spy = vi.spyOn(limiter, 'throttle')
    let resolved: unknown = 'pending'
    const pending = limiter.throttle('key', fn, 'high').then(result => {
      resolved = result
      return result
    })

    await vi.advanceTimersByTimeAsync(30)
    await pending

    expect(resolved).toBeNull()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
