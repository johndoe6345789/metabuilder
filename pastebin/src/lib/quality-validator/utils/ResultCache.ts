/**
 * Result Cache Manager for Quality Validator
 * Implements intelligent caching with SHA256 content hashing and TTL management
 * Significantly reduces analysis time for unchanged files
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger.js';
import { ensureDirectory, pathExists, readJsonFile, writeJsonFile, readFile } from './fileSystem.js';
import { AnalysisError } from '../types/index.js';

/**
 * Cache entry structure
 */
export interface CacheEntry {
  key: string;
  content: string;
  hash: string;
  timestamp: number;
  expiresAt: number;
  metadata: Record<string, unknown>;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // seconds, default 24 hours (86400)
  directory: string; // default .quality/.cache
  maxSize: number; // max entries, default 1000
}

/**
 * Cache statistics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  writes: number;
  evictions: number;
  hitRate: number;
  avgRetrievalTime: number;
}

/**
 * ResultCache provides file-level caching with content-based invalidation
 */
export class ResultCache {
  private config: CacheConfig;
  private memoryCache: Map<string, CacheEntry> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    writes: 0,
    evictions: 0,
    hitRate: 0,
    avgRetrievalTime: 0,
  };
  private retrievalTimes: number[] = [];

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      enabled: config.enabled !== false,
      ttl: config.ttl || 86400, // 24 hours default
      directory: config.directory || '.quality/.cache',
      maxSize: config.maxSize || 1000,
    };

    this.initialize();
  }

  /**
   * Initialize cache directory and load persisted cache
   */
  private initialize(): void {
    if (!this.config.enabled) {
      logger.debug('Cache disabled');
      return;
    }

    try {
      ensureDirectory(this.config.directory);
      this.loadPersistedCache();
    } catch (error) {
      logger.warn('Failed to initialize cache', {
        error: (error as Error).message,
      });
    }
  }

  /**
   * Generate SHA256 hash for content
   */
  private generateHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Generate cache key from file path
   */
  private generateKey(filePath: string, category?: string): string {
    const base = path.normalize(filePath).replace(/\//g, '__');
    return category ? `${category}__${base}` : base;
  }

  /**
   * Get cache file path
   */
  private getCacheFilePath(key: string): string {
    return path.join(this.config.directory, `${key}.json`);
  }

  /**
   * Check if cache entry is valid (not expired)
   */
  private isValid(entry: CacheEntry): boolean {
    return entry.expiresAt > Date.now();
  }

  /**
   * Get cached analysis result
   */
  get<T>(filePath: string, category?: string): T | null {
    if (!this.config.enabled) {
      return null;
    }

    const startTime = performance.now();
    const key = this.generateKey(filePath, category);

    try {
      // Check memory cache first
      if (this.memoryCache.has(key)) {
        const entry = this.memoryCache.get(key)!;
        if (this.isValid(entry)) {
          this.stats.hits++;
          const duration = performance.now() - startTime;
          this.recordRetrievalTime(duration);
          logger.debug(`Cache HIT: ${key}`);
          return JSON.parse(entry.content) as T;
        } else {
          this.memoryCache.delete(key);
        }
      }

      // Check disk cache
      const filePath = this.getCacheFilePath(key);
      if (pathExists(filePath)) {
        const entry = readJsonFile<CacheEntry>(filePath);
        if (this.isValid(entry)) {
          this.memoryCache.set(key, entry);
          this.stats.hits++;
          const duration = performance.now() - startTime;
          this.recordRetrievalTime(duration);
          logger.debug(`Cache HIT (from disk): ${key}`);
          return JSON.parse(entry.content) as T;
        }
      }

      this.stats.misses++;
      logger.debug(`Cache MISS: ${key}`);
      return null;
    } catch (error) {
      logger.warn(`Cache retrieval failed for ${key}`, {
        error: (error as Error).message,
      });
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Set cached analysis result
   */
  set<T>(filePath: string, data: T, metadata?: Record<string, unknown>, category?: string): void {
    if (!this.config.enabled) {
      return;
    }

    const key = this.generateKey(filePath, category);
    const content = JSON.stringify(data);
    const hash = this.generateHash(content);
    const now = Date.now();

    const entry: CacheEntry = {
      key,
      content,
      hash,
      timestamp: now,
      expiresAt: now + this.config.ttl * 1000,
      metadata: metadata || {},
    };

    try {
      // Store in memory cache
      if (this.memoryCache.size >= this.config.maxSize) {
        this.evictOldest();
      }
      this.memoryCache.set(key, entry);

      // Persist to disk
      const cacheFilePath = this.getCacheFilePath(key);
      writeJsonFile(cacheFilePath, entry);

      this.stats.writes++;
      logger.debug(`Cache SET: ${key} (expires in ${this.config.ttl}s)`);
    } catch (error) {
      logger.warn(`Cache write failed for ${key}`, {
        error: (error as Error).message,
      });
    }
  }

  /**
   * Check if file has changed (compare content hash)
   */
  hasChanged(filePath: string, category?: string): boolean {
    if (!this.config.enabled) {
      return true;
    }

    try {
      const key = this.generateKey(filePath, category);
      const currentContent = readFile(filePath);
      const currentHash = this.generateHash(currentContent);

      const entry = this.memoryCache.get(key);
      if (entry && this.isValid(entry)) {
        return entry.hash !== currentHash;
      }

      // Check disk
      const cacheFilePath = this.getCacheFilePath(key);
      if (pathExists(cacheFilePath)) {
        const cachedEntry = readJsonFile<CacheEntry>(cacheFilePath);
        if (this.isValid(cachedEntry)) {
          return cachedEntry.hash !== currentHash;
        }
      }

      return true;
    } catch (error) {
      logger.debug(`Change detection failed for ${filePath}`, {
        error: (error as Error).message,
      });
      return true;
    }
  }

  /**
   * Invalidate cache entry
   */
  invalidate(filePath: string, category?: string): void {
    const key = this.generateKey(filePath, category);

    try {
      // Remove from memory
      this.memoryCache.delete(key);

      // Remove from disk
      const cacheFilePath = this.getCacheFilePath(key);
      if (pathExists(cacheFilePath)) {
        fs.unlinkSync(cacheFilePath);
      }

      logger.debug(`Cache INVALIDATED: ${key}`);
    } catch (error) {
      logger.warn(`Cache invalidation failed for ${key}`, {
        error: (error as Error).message,
      });
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    try {
      this.memoryCache.clear();

      if (pathExists(this.config.directory)) {
        fs.rmSync(this.config.directory, { recursive: true, force: true });
        ensureDirectory(this.config.directory);
      }

      logger.info('Cache cleared');
    } catch (error) {
      logger.warn('Failed to clear cache', {
        error: (error as Error).message,
      });
    }
  }

  /**
   * Clean expired entries
   */
  cleanup(): void {
    try {
      let removed = 0;
      const now = Date.now();

      // Clean memory cache
      for (const [key, entry] of this.memoryCache.entries()) {
        if (entry.expiresAt <= now) {
          this.memoryCache.delete(key);
          removed++;
        }
      }

      // Clean disk cache
      if (pathExists(this.config.directory)) {
        const files = fs.readdirSync(this.config.directory);
        for (const file of files) {
          const filePath = path.join(this.config.directory, file);
          try {
            const entry = readJsonFile<CacheEntry>(filePath);
            if (entry.expiresAt <= now) {
              fs.unlinkSync(filePath);
              removed++;
            }
          } catch {
            // Skip malformed cache files
          }
        }
      }

      if (removed > 0) {
        logger.debug(`Cache cleanup removed ${removed} expired entries`);
      }
    } catch (error) {
      logger.warn('Cache cleanup failed', {
        error: (error as Error).message,
      });
    }
  }

  /**
   * Load persisted cache from disk
   */
  private loadPersistedCache(): void {
    try {
      if (!pathExists(this.config.directory)) {
        return;
      }

      const files = fs.readdirSync(this.config.directory);
      const now = Date.now();
      let loaded = 0;
      let skipped = 0;

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        try {
          const filePath = path.join(this.config.directory, file);
          const entry = readJsonFile<CacheEntry>(filePath);

          if (entry.expiresAt > now) {
            this.memoryCache.set(entry.key, entry);
            loaded++;
          } else {
            skipped++;
          }
        } catch {
          // Skip malformed cache files
        }
      }

      logger.debug(`Cache loaded: ${loaded} entries (${skipped} expired)`);
    } catch (error) {
      logger.warn('Failed to load persisted cache', {
        error: (error as Error).message,
      });
    }
  }

  /**
   * Evict oldest entry when cache is full
   */
  private evictOldest(): void {
    let oldest: [string, CacheEntry] | null = null;

    for (const entry of this.memoryCache.entries()) {
      if (!oldest || entry[1].timestamp < oldest[1].timestamp) {
        oldest = entry;
      }
    }

    if (oldest) {
      const [key] = oldest;
      this.memoryCache.delete(key);
      this.stats.evictions++;
      logger.debug(`Cache evicted oldest entry: ${key}`);
    }
  }

  /**
   * Record retrieval time for statistics
   */
  private recordRetrievalTime(duration: number): void {
    this.retrievalTimes.push(duration);
    if (this.retrievalTimes.length > 1000) {
      this.retrievalTimes = this.retrievalTimes.slice(-500);
    }
    this.updateStats();
  }

  /**
   * Update cache statistics
   */
  private updateStats(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    if (this.retrievalTimes.length > 0) {
      this.stats.avgRetrievalTime =
        this.retrievalTimes.reduce((a, b) => a + b, 0) / this.retrievalTimes.length;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get cache size information
   */
  getSize(): { memory: number; disk: number; files: number } {
    let diskSize = 0;
    let fileCount = 0;

    try {
      if (pathExists(this.config.directory)) {
        const files = fs.readdirSync(this.config.directory);
        fileCount = files.filter((f) => f.endsWith('.json')).length;

        for (const file of files) {
          const filePath = path.join(this.config.directory, file);
          const stat = fs.statSync(filePath);
          diskSize += stat.size;
        }
      }
    } catch (error) {
      logger.debug('Failed to calculate cache size', {
        error: (error as Error).message,
      });
    }

    return {
      memory: this.memoryCache.size,
      disk: diskSize,
      files: fileCount,
    };
  }
}

/**
 * Global cache instance
 */
let globalCache: ResultCache | null = null;

/**
 * Get or create global cache instance
 */
export function getGlobalCache(config?: Partial<CacheConfig>): ResultCache {
  if (!globalCache) {
    globalCache = new ResultCache(config);
  }
  return globalCache;
}

/**
 * Reset global cache instance
 */
export function resetGlobalCache(): void {
  globalCache = null;
}

// Export singleton instance
export const resultCache = getGlobalCache();
