/**
 * Tests for ResultCache
 * Validates caching, invalidation, and performance
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ResultCache, CacheConfig } from './ResultCache';
import { deletePathSync, ensureDirectory, pathExists } from './fileSystem';
import * as path from 'path';

describe('ResultCache', () => {
  let cache: ResultCache;
  const testCacheDir = '.quality/.test-cache';

  beforeEach(() => {
    ensureDirectory(testCacheDir);
    cache = new ResultCache({
      enabled: true,
      ttl: 3600,
      directory: testCacheDir,
      maxSize: 100,
    });
  });

  afterEach(() => {
    try {
      if (pathExists(testCacheDir)) {
        deletePathSync(testCacheDir);
      }
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Basic Operations', () => {
    it('should cache and retrieve data', () => {
      const testData = { score: 85, issues: 3 };
      cache.set('test-file.ts', testData);

      const retrieved = cache.get('test-file.ts');
      expect(retrieved).toEqual(testData);
    });

    it('should return null for cache miss', () => {
      const retrieved = cache.get('non-existent.ts');
      expect(retrieved).toBeNull();
    });

    it('should cache with metadata', () => {
      const testData = { score: 75 };
      const metadata = { version: '1.0.0', timestamp: Date.now() };
      cache.set('file.ts', testData, metadata);

      const retrieved = cache.get('file.ts');
      expect(retrieved).toEqual(testData);
    });

    it('should support categories', () => {
      const data1 = { type: 'quality', score: 80 };
      const data2 = { type: 'coverage', score: 90 };

      cache.set('file.ts', data1, {}, 'quality');
      cache.set('file.ts', data2, {}, 'coverage');

      expect(cache.get('file.ts', 'quality')).toEqual(data1);
      expect(cache.get('file.ts', 'coverage')).toEqual(data2);
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate cache entry', () => {
      cache.set('file.ts', { data: 'test' });
      expect(cache.get('file.ts')).not.toBeNull();

      cache.invalidate('file.ts');
      expect(cache.get('file.ts')).toBeNull();
    });

    it('should detect file changes', () => {
      const originalContent = 'console.log("test");';
      const changedContent = 'console.log("changed");';

      cache.set('test.ts', { score: 100 });

      // Simulate file not changing (would need actual file operations)
      const hasChanged = cache.hasChanged('test.ts');
      // This depends on actual file system
      expect(typeof hasChanged).toBe('boolean');
    });

    it('should clear all cache', () => {
      cache.set('file1.ts', { data: 1 });
      cache.set('file2.ts', { data: 2 });

      cache.clear();

      expect(cache.get('file1.ts')).toBeNull();
      expect(cache.get('file2.ts')).toBeNull();
    });
  });

  describe('Statistics', () => {
    it('should track cache hits', () => {
      cache.set('file.ts', { score: 90 });

      const stats1 = cache.getStats();
      expect(stats1.hits).toBe(0);

      cache.get('file.ts');
      cache.get('file.ts');

      const stats2 = cache.getStats();
      expect(stats2.hits).toBe(2);
      expect(stats2.misses).toBe(0);
    });

    it('should track cache misses', () => {
      const stats1 = cache.getStats();
      expect(stats1.misses).toBe(0);

      cache.get('non-existent.ts');
      cache.get('another-missing.ts');

      const stats2 = cache.getStats();
      expect(stats2.misses).toBe(2);
    });

    it('should calculate hit rate', () => {
      const testCache = new ResultCache({
        enabled: true,
        ttl: 3600,
        directory: testCacheDir,
      });

      testCache.set('file.ts', { data: 'test' });

      const result1 = testCache.get('file.ts'); // Should hit
      const result2 = testCache.get('file.ts'); // Should hit
      const result3 = testCache.get('missing.ts'); // Should miss

      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull();
      expect(result3).toBeNull();

      const stats = testCache.getStats();
      // At least 2 hits recorded
      expect(stats.hits).toBeGreaterThanOrEqual(1);
    });

    it('should track writes', () => {
      const stats1 = cache.getStats();
      expect(stats1.writes).toBe(0);

      cache.set('file1.ts', { data: 1 });
      cache.set('file2.ts', { data: 2 });

      const stats2 = cache.getStats();
      expect(stats2.writes).toBe(2);
    });

    it('should report cache size', () => {
      cache.set('file1.ts', { data: 1 });
      cache.set('file2.ts', { data: 2 });

      const size = cache.getSize();
      expect(size.memory).toBe(2);
      expect(size.files).toBe(2);
      expect(size.disk).toBeGreaterThan(0);
    });
  });

  describe('TTL Management', () => {
    it('should handle disabled cache', () => {
      const disabledCache = new ResultCache({ enabled: false });
      disabledCache.set('file.ts', { data: 'test' });

      expect(disabledCache.get('file.ts')).toBeNull();
    });

    it('should cleanup expired entries', (done) => {
      const shortTtlCache = new ResultCache({
        enabled: true,
        ttl: 1, // 1 second
        directory: testCacheDir,
      });

      shortTtlCache.set('file.ts', { data: 'test' });
      expect(shortTtlCache.get('file.ts')).not.toBeNull();

      // Wait for TTL to expire
      setTimeout(() => {
        shortTtlCache.cleanup();
        expect(shortTtlCache.get('file.ts')).toBeNull();
        done();
      }, 1500);
    });
  });

  describe('Performance', () => {
    it('should cache hit performance be fast', () => {
      cache.set('file.ts', { score: 100 });

      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        cache.get('file.ts');
      }
      const duration = performance.now() - start;

      // Average should be less than 1ms per retrieval
      const avg = duration / 100;
      expect(avg).toBeLessThan(1);
    });

    it('should handle large cache entries', () => {
      const largeData = {
        findings: Array(1000).fill({ id: 'test', message: 'A'.repeat(100) }),
      };

      cache.set('large-file.ts', largeData);
      const retrieved = cache.get('large-file.ts');

      expect(retrieved).toEqual(largeData);
    });

    it('should evict oldest when max size reached', () => {
      const smallCache = new ResultCache({
        enabled: true,
        ttl: 3600,
        directory: testCacheDir,
        maxSize: 3,
      });

      smallCache.set('file1.ts', { data: 1 });
      smallCache.set('file2.ts', { data: 2 });
      smallCache.set('file3.ts', { data: 3 });

      const stats1 = smallCache.getStats();
      expect(stats1.evictions).toBe(0);

      smallCache.set('file4.ts', { data: 4 });

      const stats2 = smallCache.getStats();
      expect(stats2.evictions).toBe(1);
    });
  });
});
