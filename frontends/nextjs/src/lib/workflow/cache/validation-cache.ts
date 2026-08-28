/**
 * Validation results, kept only as long as they are worth trusting.
 *
 * Split out of workflow-loader-v2.ts, which was 904 lines and untestable as
 * one unit -- which is why none of it was covered.
 */

import type { WorkflowValidationResult } from '@metabuilder/workflow'

import {
  CLEANUP_INTERVAL_MS,
  DEFAULT_MAX_ENTRIES,
  DEFAULT_TTL_MS,
  type CacheEntry,
  type CacheReport,
  type CacheStatistics,
} from './cache-types'
import { buildReport, evictOldest, sweepExpired } from './cache-maintenance'

export class ValidationCache {
  private readonly memoryCache = new Map<string, CacheEntry>()
  private readonly maxEntries: number
  private readonly ttlMs: number
  private readonly stats: CacheStatistics = { hits: 0, misses: 0 }
  private cleanupInterval: ReturnType<typeof setInterval> | null = null

  constructor(
    ttlMs: number = DEFAULT_TTL_MS,
    maxEntries: number = DEFAULT_MAX_ENTRIES
  ) {
    this.ttlMs = ttlMs
    this.maxEntries = maxEntries
    this.startCleanupInterval()
  }

  /** The cached result, or null if absent or too old to trust. */
  get(key: string): WorkflowValidationResult | null {
    const entry = this.memoryCache.get(key)
    if (entry !== undefined) {
      if (Date.now() - entry.timestamp < entry.ttl) {
        this.stats.hits++
        return entry.value
      }
      this.memoryCache.delete(key)
    }
    this.stats.misses++
    return null
  }

  /** Stores a result, evicting the oldest entry once the cache is full. */
  set(key: string, value: WorkflowValidationResult): void {
    const entry = { value, timestamp: Date.now(), ttl: this.ttlMs }
    this.memoryCache.set(key, entry)
    evictOldest(this.memoryCache, this.maxEntries)
  }

  delete(key: string): void {
    this.memoryCache.delete(key)
  }

  /** Empties the cache and resets the counters with it. */
  clear(): void {
    this.memoryCache.clear()
    this.stats.hits = 0
    this.stats.misses = 0
  }

  getStats(): CacheReport {
    return buildReport(this.stats, this.memoryCache)
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      sweepExpired(this.memoryCache, Date.now())
    }, CLEANUP_INTERVAL_MS)
  }

  /** Stops the sweep. Without this the timer keeps a process alive. */
  destroy(): void {
    if (this.cleanupInterval !== null) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}
