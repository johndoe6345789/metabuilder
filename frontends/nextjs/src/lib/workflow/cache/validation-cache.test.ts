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
})

describe('getByPrefix', () => {
  it('finds an entry by the prefix of its key', () => {
    const cache = make(1000, 10)
    cache.set('acme:wf1:abc123', result())
    expect(cache.getByPrefix('acme:wf1:')).toEqual(result())
  })

  // Entries are keyed `tenant:id:hash`, so a caller holding only a tenant
  // and a workflow id cannot name the key -- asking for `tenant:id`
  // matched nothing, and the lookup could only ever answer null.
  it('answers where an exact-key lookup could not', () => {
    const cache = make(1000, 10)
    cache.set('acme:wf1:abc123', result())
    expect(cache.get('acme:wf1')).toBeNull()
    expect(cache.getByPrefix('acme:wf1:')).not.toBeNull()
  })

  it('is null when nothing matches', () => {
    const cache = make(1000, 10)
    cache.set('acme:wf1:abc', result())
    expect(cache.getByPrefix('acme:wf2:')).toBeNull()
  })

  it('does not cross tenants', () => {
    const cache = make(1000, 10)
    cache.set('other:wf1:abc', result())
    expect(cache.getByPrefix('acme:wf1:')).toBeNull()
  })

  it('ignores an entry that has expired', () => {
    vi.useFakeTimers()
    const cache = make(100, 10)
    cache.set('acme:wf1:abc', result())
    vi.advanceTimersByTime(200)
    expect(cache.getByPrefix('acme:wf1:')).toBeNull()
    vi.useRealTimers()
  })

  // Two entries under one prefix are two versions of the same workflow.
  it('prefers the newest of several versions', () => {
    vi.useFakeTimers()
    const cache = make(10000, 10)
    cache.set('acme:wf1:old', result(false))
    vi.advanceTimersByTime(10)
    cache.set('acme:wf1:new', result(true))
    expect(cache.getByPrefix('acme:wf1:')).toEqual(result(true))
    vi.useRealTimers()
  })

  it('counts a find as a hit and a miss as a miss', () => {
    const cache = make(1000, 10)
    cache.set('acme:wf1:abc', result())
    cache.getByPrefix('acme:wf1:')
    cache.getByPrefix('acme:missing:')
    expect(cache.getStats()).toMatchObject({ hits: 1, misses: 1 })
  })
})
