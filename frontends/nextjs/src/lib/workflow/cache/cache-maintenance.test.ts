import { describe, expect, it } from 'vitest'

import {
  buildReport,
  estimateMegabytes,
  evictOldest,
  sweepExpired,
} from './cache-maintenance'
import type { CacheEntry } from './cache-types'

const entry = (timestamp: number, ttl = 1000): CacheEntry =>
  ({ value: { valid: true }, timestamp, ttl }) as CacheEntry

describe('sweepExpired', () => {
  it('removes only entries past their own ttl', () => {
    const map = new Map([
      ['fresh', entry(950)],
      ['stale', entry(0)],
    ])

    expect(sweepExpired(map, 1000)).toBe(1)
    expect([...map.keys()]).toEqual(['fresh'])
  })

  it('treats an entry exactly at its ttl as expired', () => {
    const map = new Map([['edge', entry(0, 1000)]])
    expect(sweepExpired(map, 1000)).toBe(1)
  })

  it('respects per-entry ttl rather than one global age', () => {
    const map = new Map([
      ['short', entry(0, 100)],
      ['long', entry(0, 10_000)],
    ])

    sweepExpired(map, 500)

    expect([...map.keys()]).toEqual(['long'])
  })

  it('reports nothing removed from an empty cache', () => {
    expect(sweepExpired(new Map(), 1000)).toBe(0)
  })
})

describe('evictOldest', () => {
  it('drops oldest-first until the cache fits', () => {
    const map = new Map([
      ['a', entry(1)],
      ['b', entry(2)],
      ['c', entry(3)],
    ])

    expect(evictOldest(map, 1)).toBe(2)
    expect([...map.keys()]).toEqual(['c'])
  })

  it('does nothing when the cache is already within its limit', () => {
    const map = new Map([['a', entry(1)]])
    expect(evictOldest(map, 5)).toBe(0)
    expect(map.size).toBe(1)
  })

  it('evicts by insertion order, so reading does not protect an entry', () => {
    const map = new Map([
      ['a', entry(1)],
      ['b', entry(2)],
    ])
    map.get('a')

    evictOldest(map, 1)

    expect([...map.keys()]).toEqual(['b'])
  })
})
