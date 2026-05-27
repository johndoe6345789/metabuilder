/**
 * Type definitions for ResultCache
 */

export interface CacheEntry {
  key: string;
  content: string;
  hash: string;
  timestamp: number;
  expiresAt: number;
  metadata: Record<string, unknown>;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number;
  directory: string;
  maxSize: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  writes: number;
  evictions: number;
  hitRate: number;
  avgRetrievalTime: number;
}
