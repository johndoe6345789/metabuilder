/**
 * Result Cache Manager for Quality Validator
 * Intelligent caching with SHA256 content hashing and TTL management
 */
import { logger } from './logger.js';
import { ensureDirectory } from './fileSystem.js';
import { loadCacheFromDisk, writeCacheToDisk, deleteCacheFile, cleanExpiredDiskEntries, clearCacheDirectory, calcDiskSize, } from './cache-io.js';
import { cacheGet, cacheHasChanged, cacheHash, cacheKey } from './cache-read.js';
export class ResultCache {
    constructor(config = {}) {
        this.mem = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            writes: 0,
            evictions: 0,
            hitRate: 0,
            avgRetrievalTime: 0,
        };
        this.retrievalTimes = [];
        this.config = {
            enabled: config.enabled !== false,
            ttl: config.ttl || 86400,
            directory: config.directory || '.quality/.cache',
            maxSize: config.maxSize || 1000,
        };
        this.init();
    }
    init() {
        if (!this.config.enabled)
            return;
        try {
            ensureDirectory(this.config.directory);
            loadCacheFromDisk(this.config.directory, this.mem);
        }
        catch (err) {
            logger.warn('Failed to init cache', {
                error: err.message,
            });
        }
    }
    get(filePath, category) {
        return cacheGet(this.config, this.mem, this.stats, this.retrievalTimes, filePath, category);
    }
    set(filePath, data, metadata, category) {
        if (!this.config.enabled)
            return;
        const k = cacheKey(filePath, category);
        const content = JSON.stringify(data);
        const now = Date.now();
        const entry = {
            key: k,
            content,
            hash: cacheHash(content),
            timestamp: now,
            expiresAt: now + this.config.ttl * 1000,
            metadata: metadata || {},
        };
        try {
            if (this.mem.size >= this.config.maxSize)
                this.evictOldest();
            this.mem.set(k, entry);
            writeCacheToDisk(this.config.directory, k, entry);
            this.stats.writes++;
        }
        catch (err) {
            logger.warn(`Cache set failed for ${k}`, {
                error: err.message,
            });
        }
    }
    hasChanged(filePath, category) {
        return cacheHasChanged(this.config, this.mem, filePath, category);
    }
    invalidate(filePath, category) {
        const k = cacheKey(filePath, category);
        this.mem.delete(k);
        try {
            deleteCacheFile(this.config.directory, k);
        }
        catch (err) {
            logger.warn(`Cache invalidate failed for ${k}`, {
                error: err.message,
            });
        }
    }
    clear() {
        this.mem.clear();
        clearCacheDirectory(this.config.directory);
    }
    cleanup() {
        const now = Date.now();
        let removed = 0;
        for (const [k, entry] of this.mem.entries()) {
            if (entry.expiresAt <= now) {
                this.mem.delete(k);
                removed++;
            }
        }
        removed += cleanExpiredDiskEntries(this.config.directory);
        if (removed > 0) {
            logger.debug(`Cache cleanup removed ${removed} expired entries`);
        }
    }
    getStats() {
        return { ...this.stats };
    }
    getSize() {
        const { size, files } = calcDiskSize(this.config.directory);
        return { memory: this.mem.size, disk: size, files };
    }
    evictOldest() {
        let oldest = null;
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
let globalCache = null;
export function getGlobalCache(config) {
    if (!globalCache)
        globalCache = new ResultCache(config);
    return globalCache;
}
export function resetGlobalCache() {
    globalCache = null;
}
export const resultCache = getGlobalCache();
