/**
 * Rate Limiter - Generic rate limiting utility with configurable windows and retries
 *
 * Features:
 * - Token bucket rate limiting per key
 * - Priority-based retry logic
 * - Auto-cleanup of stale entries
 * - Gateway error detection
 */

export interface RateLimitConfig {
  /** Maximum requests allowed in the time window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Delay between retries in milliseconds */
  retryDelay: number;
  /** Maximum number of retries for high-priority requests */
  maxRetries?: number;
}

interface RequestRecord {
  timestamp: number;
  count: number;
}

export type Priority = 'low' | 'medium' | 'high';

export interface RateLimitStatus {
  /** Number of remaining requests in current window */
  remaining: number;
  /** Seconds until rate limit resets */
  resetIn: number;
}

export class RateLimiter {
  private requests: Map<string, RequestRecord> = new Map();
  private config: RateLimitConfig;

  constructor(
    config: RateLimitConfig = {
      maxRequests: 5,
      windowMs: 60000,
      retryDelay: 2000,
      maxRetries: 3,
    }
  ) {
    this.config = config;
  }

  /**
   * Execute a function with rate limiting
   *
   * @param key - Unique key for rate limiting bucket
   * @param fn - Async function to execute
   * @param priority - Request priority (high = retry on limit)
   * @returns Result of fn or null if rate limited
   */
  async throttle<T>(
    key: string,
    fn: () => Promise<T>,
    priority: Priority = 'medium'
  ): Promise<T | null> {
    const maxRetries = this.config.maxRetries ?? 3;
    let attempts = 0;

    while (true) {
      const now = Date.now();
      const record = this.requests.get(key);
      let isLimited = false;

      if (record) {
        const timeElapsed = now - record.timestamp;

        if (timeElapsed < this.config.windowMs) {
          if (record.count >= this.config.maxRequests) {
            console.warn(
              `Rate limit exceeded for ${key}. Try again in ${Math.ceil(
                (this.config.windowMs - timeElapsed) / 1000
              )}s`
            );
            isLimited = true;
          } else {
            record.count++;
          }
        } else {
          this.requests.set(key, { timestamp: now, count: 1 });
        }
      } else {
        this.requests.set(key, { timestamp: now, count: 1 });
      }

      this.cleanup();

      if (isLimited) {
        if (priority === 'high' && attempts < maxRetries) {
          attempts += 1;
          await new Promise((resolve) =>
            setTimeout(resolve, this.config.retryDelay)
          );
          continue;
        }

        return null;
      }

      try {
        return await fn();
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes('502') ||
            error.message.includes('Bad Gateway') ||
            error.message.includes('429') ||
            error.message.includes('rate limit'))
        ) {
          console.error(`Gateway error for ${key}:`, error.message);
          // Mark as fully consumed on gateway errors
          const updatedRecord = this.requests.get(key);
          if (updatedRecord) {
            updatedRecord.count = this.config.maxRequests;
          }
        }
        throw error;
      }
    }
  }

  /**
   * Clean up stale entries older than 2x window
   */
  private cleanup(): void {
    const now = Date.now();
    this.requests.forEach((record, key) => {
      if (now - record.timestamp > this.config.windowMs * 2) {
        this.requests.delete(key);
      }
    });
  }

  /**
   * Reset rate limit state
   *
   * @param key - If provided, reset only that key; otherwise reset all
   */
  reset(key?: string): void {
    if (key) {
      this.requests.delete(key);
    } else {
      this.requests.clear();
    }
  }

  /**
   * Get current rate limit status for a key
   */
  getStatus(key: string): RateLimitStatus {
    const record = this.requests.get(key);
    if (!record) {
      return { remaining: this.config.maxRequests, resetIn: 0 };
    }

    const now = Date.now();
    const timeElapsed = now - record.timestamp;

    if (timeElapsed >= this.config.windowMs) {
      return { remaining: this.config.maxRequests, resetIn: 0 };
    }

    return {
      remaining: Math.max(0, this.config.maxRequests - record.count),
      resetIn: Math.ceil((this.config.windowMs - timeElapsed) / 1000),
    };
  }

  /**
   * Check if a key is currently rate limited
   */
  isLimited(key: string): boolean {
    return this.getStatus(key).remaining === 0;
  }
}

/**
 * Pre-configured rate limiter for AI/LLM operations
 * 3 requests per minute, 3s retry delay
 */
export const aiRateLimiter = new RateLimiter({
  maxRequests: 3,
  windowMs: 60000,
  retryDelay: 3000,
});

/**
 * Pre-configured rate limiter for scan/analysis operations
 * 1 request per 30 seconds, 5s retry delay
 */
export const scanRateLimiter = new RateLimiter({
  maxRequests: 1,
  windowMs: 30000,
  retryDelay: 5000,
});

/**
 * Pre-configured rate limiter for API operations
 * 100 requests per minute, 1s retry delay
 */
export const apiRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000,
  retryDelay: 1000,
  maxRetries: 5,
});
