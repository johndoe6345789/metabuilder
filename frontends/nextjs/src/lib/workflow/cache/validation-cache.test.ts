import { afterEach, describe, expect, it, vi } from 'vitest'

import { ValidationCache } from './validation-cache'
import type { WorkflowValidationResult } from '@metabuilder/workflow'

const result = (valid = true) => ({ valid }) as WorkflowValidationResult
const caches: ValidationCache[] = []

/** Every cache starts an interval; leaving one running hangs the run. */
const make = (ttl?: number, max?: number): ValidationCache => {
  const cache = new ValidationCache(ttl, max)
  caches.push(cache)
  return cache
}

afterEach(() => {
  caches.splice(0).forEach(cache => {
    cache.destroy()
  })
  vi.useRealTimers()
})

describe('ValidationCache', () => {
  it('returns what was stored, and null for what was not', () => {
    const cache = make()
    cache.set('k', result())

    expect(cache.get('k')).toEqual({ valid: true })
    expect(cache.get('absent')).toBeNull()
  })

  it('counts hits and misses as they happen', () => {
    const cache = make()
    cache.set('k', result())
    cache.get('k')
    cache.get('nope')

    const stats = cache.getStats()
    expect(stats.hits).toBe(1)
    expect(stats.misses).toBe(1)
    expect(stats.hitRate).toBe(50)
  })

  it('forgets an entry once its ttl has passed', () => {
    vi.useFakeTimers()
    const cache = make(1000)
    cache.set('k', result())

    vi.advanceTimersByTime(1001)

    // An expired read is a miss, not a stale hit.
    expect(cache.get('k')).toBeNull()
    expect(cache.getStats().misses).toBe(1)
  })

  it('evicts the oldest entry when it goes over its limit', () => {
    const cache = make(undefined, 2)
    cache.set('a', result())
    cache.set('b', result())
    cache.set('c', result())

    expect(cache.get('a')).toBeNull()
    expect(cache.get('c')).not.toBeNull()
  })

  it('delete removes one entry; clear resets the counters too', () => {
    const cache = make()
    cache.set('a', result())
    cache.get('a')
    cache.delete('a')
    expect(cache.get('a')).toBeNull()

    cache.clear()
    expect(cache.getStats()).toMatchObject({ hits: 0, misses: 0, entries: 0 })
  })

  it('destroy stops the sweep, so it cannot hold a process open', () => {
    const cache = new ValidationCache()
    const clear = vi.spyOn(globalThis, 'clearInterval')

    cache.destroy()
    cache.destroy()

    // Idempotent: the second call must not clear a stale handle.
    expect(clear).toHaveBeenCalledTimes(1)
  })
})
