import { describe, expect, it } from 'vitest'

import { isErrorRetryable } from './retryable'

describe('isErrorRetryable', () => {
  it.each(['network', 'timeout', 'rate-limit', 'server'] as const)(
    'treats %s as retryable regardless of status code',
    category => {
      expect(isErrorRetryable(category)).toBe(true)
    }
  )

  it.each(['authentication', 'permission', 'validation', 'not-found', 'conflict', 'unknown'] as const)(
    'treats %s as not retryable with no status code',
    category => {
      expect(isErrorRetryable(category)).toBe(false)
    }
  )

  it.each([408, 429, 500, 502, 503, 504])(
    'treats status %i as retryable even for a non-retryable category',
    status => {
      expect(isErrorRetryable('validation', status)).toBe(true)
    }
  )

  it('is not retryable for a non-retryable category and status', () => {
    expect(isErrorRetryable('validation', 400)).toBe(false)
  })
})
