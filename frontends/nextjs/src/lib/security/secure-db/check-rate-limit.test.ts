import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { checkRateLimit } from './check-rate-limit'
import { clearRateLimit } from './clear-rate-limit'
import { clearAllRateLimits } from './clear-all-rate-limits'
import { MAX_REQUESTS_PER_WINDOW, RATE_LIMIT_WINDOW } from './rate-limit-store'

const BASE_TIME = new Date('2024-01-01T00:00:00Z')

describe('rate limit helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(BASE_TIME)
    clearAllRateLimits()
  })

  afterEach(() => {
    clearAllRateLimits()
    vi.useRealTimers()
  })

  describe('checkRateLimit', () => {
    it.each([
      { name: 'allows requests up to the limit', attempts: MAX_REQUESTS_PER_WINDOW, expected: true },
      { name: 'blocks requests over the limit', attempts: MAX_REQUESTS_PER_WINDOW + 1, expected: false },
    ])('$name', ({ attempts, expected }) => {
      const userId = 'user-limit'
      let lastResult = true

      for (let i = 0; i < attempts; i += 1) {
        lastResult = checkRateLimit(userId)
      }

      expect(lastResult).toBe(expected)
    })

    it.each([
      { name: 'block before the window expires', advanceMs: RATE_LIMIT_WINDOW - 1, expected: false },
      { name: 'allow after the window expires', advanceMs: RATE_LIMIT_WINDOW + 1, expected: true },
    ])('should $name', ({ advanceMs, expected }) => {
      const userId = 'user-window'

      for (let i = 0; i < MAX_REQUESTS_PER_WINDOW; i += 1) {
        checkRateLimit(userId)
      }

      expect(checkRateLimit(userId)).toBe(false)

      vi.setSystemTime(new Date(BASE_TIME.getTime() + advanceMs))

      expect(checkRateLimit(userId)).toBe(expected)
    })
  })

  describe('clearRateLimit', () => {
    it.each([{ userId: 'user-a' }, { userId: 'user-b' }])('should reset for $userId', ({ userId }) => {
      for (let i = 0; i < MAX_REQUESTS_PER_WINDOW; i += 1) {
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
        for (let i = 0; i < MAX_REQUESTS_PER_WINDOW; i += 1) {
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
