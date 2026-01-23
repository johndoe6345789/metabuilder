/**
 * LRU (Least Recently Used) Cache for Executor Instances
 * @packageDocumentation
 */

export interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
}

/**
 * LRU Cache implementation with automatic eviction
 * Tracks cache hits/misses and maintains access order for efficient eviction
 *
 * @template K - Key type
 * @template V - Value type
 */
export class LRUCache<K, V> {
  private maxSize: number;
  private cache: Map<K, V> = new Map();
  private accessOrder: K[] = [];

  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0
  };

  /**
   * Create a new LRU cache
   * @param maxSize - Maximum number of items to store (default: 1000)
   */
  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  /**
   * Get value from cache
   * Updates access order when key is found (marks as recently used)
   *
   * @param key - Cache key
   * @returns Value if found, undefined otherwise
   */
  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      this.stats.misses++;
      return undefined;
    }

    // Move to end (most recently used)
    const index = this.accessOrder.indexOf(key);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);

    this.stats.hits++;
    return this.cache.get(key);
  }

  /**
   * Set value in cache
   * Updates access order and evicts oldest entry if capacity exceeded
   *
   * @param key - Cache key
   * @param value - Value to cache
   */
  set(key: K, value: V): void {
    // Remove if already exists
    if (this.cache.has(key)) {
      const index = this.accessOrder.indexOf(key);
      if (index !== -1) {
        this.accessOrder.splice(index, 1);
      }
    }

    // Add to end
    this.cache.set(key, value);
    this.accessOrder.push(key);

    // Evict LRU if over capacity
    if (this.cache.size > this.maxSize) {
      const oldest = this.accessOrder.shift();
      if (oldest !== undefined) {
        this.cache.delete(oldest);
        this.stats.evictions++;
      }
    }
  }

  /**
   * Check if key exists in cache
   * Does not update access order
   *
   * @param key - Cache key
   * @returns true if key exists, false otherwise
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * Remove a specific key from cache
   * @param key - Cache key
   * @returns true if key was removed, false if not found
   */
  invalidate(key: K): boolean {
    const had = this.cache.has(key);

    if (had) {
      this.cache.delete(key);
      const index = this.accessOrder.indexOf(key);
      if (index !== -1) {
        this.accessOrder.splice(index, 1);
      }
    }

    return had;
  }

  /**
   * Clear all entries from cache
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Get current cache size
   * @returns Number of items currently in cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics including hit/miss rates and evictions
   *
   * @returns Cache statistics object
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: parseFloat(hitRate.toFixed(2)),
      evictions: this.stats.evictions
    };
  }

  /**
   * Get all keys in cache in access order
   * First key is least recently used, last key is most recently used
   *
   * @returns Array of cache keys
   */
  keys(): K[] {
    return Array.from(this.accessOrder);
  }

  /**
   * Peek at value without updating access order
   * Useful for checking cache contents without affecting LRU behavior
   *
   * @param key - Cache key
   * @returns Value if found, undefined otherwise (no stats update)
   */
  peek(key: K): V | undefined {
    return this.cache.get(key);
  }
}
