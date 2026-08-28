import type { WorkflowValidationResult } from '@metabuilder/workflow'

/** One cached validation, with the age at which it stops counting. */
export interface CacheEntry {
  value: WorkflowValidationResult
  /** When it was cached, in epoch milliseconds. */
  timestamp: number
  /** How long it stays valid, in milliseconds. */
  ttl: number
}

export interface CacheStatistics {
  hits: number
  misses: number
}

/** What getStats() reports: the counters plus what they add up to. */
export interface CacheReport extends CacheStatistics {
  /** Hits as a percentage of lookups; 0 when nothing has been asked for. */
  hitRate: number
  entries: number
  memoryUsedMb: number
}

export const DEFAULT_TTL_MS = 3_600_000
export const DEFAULT_MAX_ENTRIES = 100
/** How often expired entries are swept out in the background. */
export const CLEANUP_INTERVAL_MS = 5 * 60 * 1000
