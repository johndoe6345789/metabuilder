import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { checkRateLimit } from './check-rate-limit'
import { clearRateLimit } from './clear-rate-limit'
import { clearAllRateLimits } from './clear-all-rate-limits'
import {
  DEFAULT_MAX_REQUESTS_PER_WINDOW,
  DEFAULT_RATE_LIMIT_WINDOW_MS,
  getRateLimitConfig,
  resetRateLimitConfig,
} from './rate-limit-store'

const BASE_TIME = new Date('2024-01-01T00:00:00Z')
const ENV_RATE_LIMIT_WINDOW_MS = 'MB_RATE_LIMIT_WINDOW_MS'
const ENV_MAX_REQUESTS = 'MB_RATE_LIMIT_MAX_REQUESTS'

const resetRateLimitEnv = () => {
  delete process.env[ENV_RATE_LIMIT_WINDOW_MS]
  delete process.env[ENV_MAX_REQUESTS]
  resetRateLimitConfig()
}

describe('rate limit helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(BASE_TIME)
    clearAllRateLimits()
    resetRateLimitEnv()
  })

  afterEach(() => {
    clearAllRateLimits()
    vi.useRealTimers()
    resetRateLimitEnv()
  })

  describe('rate limit config', () => {
    it('uses defaults when env is unset', () => {
      const { windowMs, maxRequests } = getRateLimitConfig()

      expect(windowMs).toBe(DEFAULT_RATE_LIMIT_WINDOW_MS)
      expect(maxRequests).toBe(DEFAULT_MAX_REQUESTS_PER_WINDOW)
    })

    it('uses env overrides when valid', () => {
      process.env[ENV_RATE_LIMIT_WINDOW_MS] = '120000'
      process.env[ENV_MAX_REQUESTS] = '250'
      resetRateLimitConfig()

      const { windowMs, maxRequests } = getRateLimitConfig()

      expect(windowMs).toBe(120000)
      expect(maxRequests).toBe(250)
    })

    it('falls back to defaults for invalid env values', () => {
      process.env[ENV_RATE_LIMIT_WINDOW_MS] = '-10'
      process.env[ENV_MAX_REQUESTS] = 'not-a-number'
      resetRateLimitConfig()

      const { windowMs, maxRequests } = getRateLimitConfig()

      expect(windowMs).toBe(DEFAULT_RATE_LIMIT_WINDOW_MS)
      expect(maxRequests).toBe(DEFAULT_MAX_REQUESTS_PER_WINDOW)
    })
  })

  describe('checkRateLimit', () => {
    it.each([
      { name: 'allows requests up to the limit', attempts: DEFAULT_MAX_REQUESTS_PER_WINDOW, expected: true },
      { name: 'blocks requests over the limit', attempts: DEFAULT_MAX_REQUESTS_PER_WINDOW + 1, expected: false },
    ])('$name', ({ attempts, expected }) => {
      const userId = 'user-limit'
      let lastResult = true

      for (let i = 0; i < attempts; i += 1) {
        lastResult = checkRateLimit(userId)
      }

      expect(lastResult).toBe(expected)
    })

    it.each([
      { name: 'block before the window expires', advanceMs: DEFAULT_RATE_LIMIT_WINDOW_MS - 1, expected: false },
      { name: 'allow after the window expires', advanceMs: DEFAULT_RATE_LIMIT_WINDOW_MS + 1, expected: true },
    ])('should $name', ({ advanceMs, expected }) => {
      const userId = 'user-window'

      for (let i = 0; i < DEFAULT_MAX_REQUESTS_PER_WINDOW; i += 1) {
        checkRateLimit(userId)
      }

      expect(checkRateLimit(userId)).toBe(false)

      vi.setSystemTime(new Date(BASE_TIME.getTime() + advanceMs))

      expect(checkRateLimit(userId)).toBe(expected)
    })

    it('respects env-configured limits', () => {
      process.env[ENV_RATE_LIMIT_WINDOW_MS] = '1000'
      process.env[ENV_MAX_REQUESTS] = '2'
      resetRateLimitConfig()
      const userId = 'user-env'

      expect(checkRateLimit(userId)).toBe(true)
      expect(checkRateLimit(userId)).toBe(true)
      expect(checkRateLimit(userId)).toBe(false)
    })
  })

  describe('clearRateLimit', () => {
    it.each([{ userId: 'user-a' }, { userId: 'user-b' }])('should reset for $userId', ({ userId }) => {
      for (let i = 0; i < DEFAULT_MAX_REQUESTS_PER_WINDOW; i += 1) {
        checkRateLimit(userId)
      }

      expect(checkRateLimit(userId)).toBe(false)

      clearRateLimit(userId)

      expect(checkRateLimit(userId)).toBe(true)
    })
  })

  describe('clearAllRateLimits', () => {
    it.each([
      { users: ['user-a', 'user-b'] },
      { users: ['user-x', 'user-y', 'user-z'] },
    ])('should reset all users: $users', ({ users }) => {
      for (const userId of users) {
        for (let i = 0; i < DEFAULT_MAX_REQUESTS_PER_WINDOW; i += 1) {
          checkRateLimit(userId)
        }
        expect(checkRateLimit(userId)).toBe(false)
      }

      clearAllRateLimits()

      for (const userId of users) {
        expect(checkRateLimit(userId)).toBe(true)
      }
    })
  })
})
