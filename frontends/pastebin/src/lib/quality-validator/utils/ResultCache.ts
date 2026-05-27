/**
 * Result Cache Manager for Quality Validator
 * Intelligent caching with SHA256 content hashing and TTL management
 */

import * as path from 'path';
import { logger } from './logger.js';
import { ensureDirectory } from './fileSystem.js';
import type { CacheEntry, CacheConfig, CacheStats } from './cache-types.js';
import {
  loadCacheFromDisk,
  writeCacheToDisk,
  deleteCacheFile,
  cleanExpiredDiskEntries,
  clearCacheDirectory,
  calcDiskSize,
} from './cache-io.js';
import {
  cacheGet,
  cacheHasChanged,
  cacheHash,
  cacheKey,
} from './cache-read.js';

export type { CacheEntry, CacheConfig, CacheStats } from './cache-types.js';

export class ResultCache {
  private config: CacheConfig;
  private mem = new Map<string, CacheEntry>();
  private stats: CacheStats = {
    hits: 0, misses: 0, writes: 0,
    evictions: 0, hitRate: 0, avgRetrievalTime: 0,
  };
  private retrievalTimes: number[] = [];

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      enabled: config.enabled !== false,
      ttl: config.ttl || 86400,
      directory: config.directory || '.quality/.cache',
      maxSize: config.maxSize || 1000,
    };
    this.init();
  }

  private init(): void {
    if (!this.config.enabled) return;
    try {
      ensureDirectory(this.config.directory);
      loadCacheFromDisk(this.config.directory, this.mem);
    } catch (err) {
      logger.warn('Failed to init cache', {
        error: (err as Error).message,
      });
    }
  }

  get<T>(filePath: string, category?: string): T | null {
    return cacheGet<T>(
      this.config, this.mem, this.stats,
      this.retrievalTimes, filePath, category
    );
  }

  set<T>(
    filePath: string,
    data: T,
    metadata?: Record<string, unknown>,
    category?: string
  ): void {
    if (!this.config.enabled) return;
    const k = cacheKey(filePath, category);
    const content = JSON.stringify(data);
    const now = Date.now();
    const entry: CacheEntry = {
      key: k, content,
      hash: cacheHash(content),
      timestamp: now,
      expiresAt: now + this.config.ttl * 1000,
      metadata: metadata || {},
    };
    try {
      if (this.mem.size >= this.config.maxSize) this.evictOldest();
      this.mem.set(k, entry);
      writeCacheToDisk(this.config.directory, k, entry);
      this.stats.writes++;
    } catch (err) {
      logger.warn(`Cache set failed for ${k}`, {
        error: (err as Error).message,
      });
    }
  }

  hasChanged(filePath: string, category?: string): boolean {
    return cacheHasChanged(this.config, this.mem, filePath, category);
  }

  invalidate(filePath: string, category?: string): void {
    const k = cacheKey(filePath, category);
    this.mem.delete(k);
    try {
      deleteCacheFile(this.config.directory, k);
    } catch (err) {
      logger.warn(`Cache invalidate failed for ${k}`, {
        error: (err as Error).message,
      });
    }
  }

  clear(): void {
    this.mem.clear();
    clearCacheDirectory(this.config.directory);
  }

  cleanup(): void {
    const now = Date.now();
    let removed = 0;
    for (const [k, entry] of this.mem.entries()) {
      if (entry.expiresAt <= now) { this.mem.delete(k); removed++; }
    }
    removed += cleanExpiredDiskEntries(this.config.directory);
    if (removed > 0) {
      logger.debug(`Cache cleanup removed ${removed} expired entries`);
    }
  }

  getStats(): CacheStats { return { ...this.stats }; }

  getSize(): { memory: number; disk: number; files: number } {
    const { size, files } = calcDiskSize(this.config.directory);
    return { memory: this.mem.size, disk: size, files };
  }

  private evictOldest(): void {
    let oldest: [string, CacheEntry] | null = null;
    for (const entry of this.mem.entries()) {
      if (!oldest || entry[1].timestamp < oldest[1].timestamp) {
        oldest = entry;
      }
    }
    if (oldest) {
      this.mem.delete(oldest[0]);
      this.stats.evictions++;
    }
  }
}

let globalCache: ResultCache | null = null;

export function getGlobalCache(
  config?: Partial<CacheConfig>
): ResultCache {
  if (!globalCache) globalCache = new ResultCache(config);
  return globalCache;
}

export function resetGlobalCache(): void { globalCache = null; }
export const resultCache = getGlobalCache();
