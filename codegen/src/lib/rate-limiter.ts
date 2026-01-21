interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  retryDelay: number
  maxRetries?: number
}

interface RequestRecord {
  timestamp: number
  count: number
}

export class RateLimiter {
  private requests: Map<string, RequestRecord> = new Map()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig = {
    maxRequests: 5,
    windowMs: 60000,
    retryDelay: 2000,
    maxRetries: 3
  }) {
    this.config = config
  }

  async throttle<T>(
    key: string,
    fn: () => Promise<T>,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<T | null> {
    const maxRetries = this.config.maxRetries ?? 3
    let attempts = 0

    while (true) {
      const now = Date.now()
      const record = this.requests.get(key)
      let isLimited = false

      if (record) {
        const timeElapsed = now - record.timestamp

        if (timeElapsed < this.config.windowMs) {
          if (record.count >= this.config.maxRequests) {
            console.warn(`Rate limit exceeded for ${key}. Try again in ${Math.ceil((this.config.windowMs - timeElapsed) / 1000)}s`)
            isLimited = true
          } else {
            record.count++
          }
        } else {
          this.requests.set(key, { timestamp: now, count: 1 })
        }
      } else {
        this.requests.set(key, { timestamp: now, count: 1 })
      }

      this.cleanup()

      if (isLimited) {
        if (priority === 'high' && attempts < maxRetries) {
          attempts += 1
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay))
          continue
        }

        return null
      }

      try {
        return await fn()
      } catch (error) {
        if (error instanceof Error && (
          error.message.includes('502') || 
          error.message.includes('Bad Gateway') ||
          error.message.includes('429') ||
          error.message.includes('rate limit')
        )) {
          console.error(`Gateway error for ${key}:`, error.message)
          const updatedRecord = this.requests.get(key)
          if (updatedRecord) {
            updatedRecord.count = this.config.maxRequests
          }
        }
        throw error
      }
    }
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, record] of this.requests.entries()) {
      if (now - record.timestamp > this.config.windowMs * 2) {
        this.requests.delete(key)
      }
    }
  }

  reset(key?: string) {
    if (key) {
      this.requests.delete(key)
    } else {
      this.requests.clear()
    }
  }

  getStatus(key: string): { remaining: number; resetIn: number } {
    const record = this.requests.get(key)
    if (!record) {
      return { remaining: this.config.maxRequests, resetIn: 0 }
    }

    const now = Date.now()
    const timeElapsed = now - record.timestamp
    
    if (timeElapsed >= this.config.windowMs) {
      return { remaining: this.config.maxRequests, resetIn: 0 }
    }

    return {
      remaining: Math.max(0, this.config.maxRequests - record.count),
      resetIn: Math.ceil((this.config.windowMs - timeElapsed) / 1000)
    }
  }
}

export const aiRateLimiter = new RateLimiter({
  maxRequests: 3,
  windowMs: 60000,
  retryDelay: 3000
})

export const scanRateLimiter = new RateLimiter({
  maxRequests: 1,
  windowMs: 30000,
  retryDelay: 5000
})
