/** Cache upkeep, kept apart from the cache so it can be tested directly. */

import type { CacheEntry, CacheReport, CacheStatistics } from './cache-types'

/**
 * Drops every entry older than its own TTL, returning how many went.
 *
 * Takes `now` rather than reading the clock so a test can age entries
 * without waiting for them.
 */
export function sweepExpired(
  entries: Map<string, CacheEntry>,
  now: number
): number {
  let removed = 0
  for (const [key, entry] of entries) {
    if (now - entry.timestamp >= entry.ttl) {
      entries.delete(key)
      removed++
    }
  }
  return removed
}

/** Rough size of the cached values, in megabytes. */
export function estimateMegabytes(entries: Iterable<CacheEntry>): number {
  let bytes = 0
  for (const entry of entries) {
    bytes += JSON.stringify(entry.value).length
  }
  return bytes / 1024 / 1024
}

/**
 * The counters plus what they add up to.
 *
 * hitRate is 0 rather than NaN before anything has been looked up: a
 * dashboard showing NaN is worse than one showing nothing happened yet.
 */
export function buildReport(
  stats: CacheStatistics,
  entries: Map<string, CacheEntry>
): CacheReport {
  const total = stats.hits + stats.misses
  return {
    ...stats,
    hitRate: total > 0 ? (stats.hits / total) * 100 : 0,
    entries: entries.size,
    memoryUsedMb: estimateMegabytes(entries.values()),
  }
}

/**
 * Drops oldest-first until the cache is within its limit.
 *
 * Insertion order, not least-recently-used: a Map iterates in the order keys
 * were added, and re-setting an existing key does not move it. Reading an
 * entry therefore does not protect it.
 */
export function evictOldest(
  entries: Map<string, CacheEntry>,
  maxEntries: number
): number {
  let removed = 0
  while (entries.size > maxEntries) {
    const oldest = entries.keys().next().value
    if (oldest === undefined) break
    entries.delete(oldest)
    removed++
  }
  return removed
}
