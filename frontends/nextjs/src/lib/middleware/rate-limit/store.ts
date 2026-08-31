export interface RateLimitStore {
  /** Get current count for key */
  get(key: string): number
  /** Increment count for key */
  increment(key: string, window: number): number
  /** Reset count for key */
  reset(key: string): void
}

/**
 * In-memory rate limit store (suitable for development and single-instance
 * deployments).
 *
 * Not suitable for distributed systems -- use a Redis adapter for a
 * multi-instance production deployment.
 */
class InMemoryRateLimitStore implements RateLimitStore {
  private readonly store = new Map<
    string,
    { count: number; resetAt: number }
  >()

  constructor() {
    // Clean up expired entries every 60 seconds. The store lives for the
    // process's whole lifetime as a module-level singleton, so this timer
    // is meant to run forever rather than be torn down.
    setInterval(() => {
      const now = Date.now()
      for (const [key, { resetAt }] of this.store.entries()) {
        if (resetAt < now) this.store.delete(key)
      }
    }, 60000)
  }

  get(key: string): number {
    const entry = this.store.get(key)
    if (entry === undefined) return 0
    if (entry.resetAt < Date.now()) {
      this.store.delete(key)
      return 0
    }
    return entry.count
  }

  increment(key: string, window: number): number {
    const now = Date.now()
    const entry = this.store.get(key)

    if (entry === undefined || entry.resetAt < now) {
      this.store.set(key, { count: 1, resetAt: now + window })
      return 1
    }

    entry.count++
    return entry.count
  }

  reset(key: string): void {
    this.store.delete(key)
  }
}

// Global store instance
let globalStore: InMemoryRateLimitStore | null = null

export function getGlobalStore(): InMemoryRateLimitStore {
  globalStore ??= new InMemoryRateLimitStore()
  return globalStore
}
