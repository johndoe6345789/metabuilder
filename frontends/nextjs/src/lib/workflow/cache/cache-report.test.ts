import { describe, expect, it } from 'vitest'

import { buildReport, estimateMegabytes } from './cache-maintenance'
import type { CacheEntry } from './cache-types'

const entry = (value: unknown): CacheEntry =>
  ({ value, timestamp: 0, ttl: 1000 }) as CacheEntry

describe('buildReport', () => {
  it('reports the hit rate as a percentage of lookups', () => {
    const report = buildReport({ hits: 3, misses: 1 }, new Map())
    expect(report.hitRate).toBe(75)
  })

  it('reports 0 rather than NaN before anything is looked up', () => {
    // 0/0 is NaN, and a dashboard showing NaN is worse than one showing that
    // nothing has happened yet.
    expect(buildReport({ hits: 0, misses: 0 }, new Map()).hitRate).toBe(0)
  })

  it('carries the raw counters through unchanged', () => {
    const report = buildReport({ hits: 2, misses: 5 }, new Map())
    expect(report.hits).toBe(2)
    expect(report.misses).toBe(5)
  })

  it('counts the entries currently held', () => {
    const map = new Map([
      ['a', entry({ valid: true })],
      ['b', entry({ valid: false })],
    ])
    expect(buildReport({ hits: 0, misses: 0 }, map).entries).toBe(2)
  })
})

describe('estimateMegabytes', () => {
  it('is zero for an empty cache', () => {
    expect(estimateMegabytes([])).toBe(0)
  })

  it('grows with the size of what is stored', () => {
    const small = estimateMegabytes([entry({ a: 1 })])
    const large = estimateMegabytes([entry({ a: 'x'.repeat(10_000) })])

    expect(small).toBeGreaterThan(0)
    expect(large).toBeGreaterThan(small)
  })

  it('measures the value, not the bookkeeping around it', () => {
    // Two entries with identical values weigh the same regardless of their
    // timestamps or ttls.
    const a: CacheEntry = {
      value: { v: 1 },
      timestamp: 0,
      ttl: 1,
    } as CacheEntry
    const b: CacheEntry = {
      value: { v: 1 },
      timestamp: 999_999,
      ttl: 999_999,
    } as CacheEntry

    expect(estimateMegabytes([a])).toBe(estimateMegabytes([b]))
  })
})
