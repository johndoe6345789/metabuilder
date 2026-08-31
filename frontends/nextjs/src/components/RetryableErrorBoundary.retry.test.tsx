import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, screen } from '@testing-library/react'

// Auto-retry timing -- split out of RetryableErrorBoundary.test.tsx (which
// covers render/fallback behavior) to stay under the 80-line file limit.

import { gate, netError, permError, renderBoundary } from './retryable-error-boundary-test-helpers'

describe('RetryableErrorBoundary automatic retry', () => {
  beforeEach(() => {
    gate.fail = true
    vi.useFakeTimers()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('recovers on its own once the child stops throwing', () => {
    renderBoundary(netError())
    expect(screen.queryByText('recovered')).toBeNull()

    gate.fail = false
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByText('recovered')).toBeTruthy()
  })

  it('does not retry before the backoff elapses', () => {
    renderBoundary(netError())

    gate.fail = false
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(screen.queryByText('recovered')).toBeNull()
  })

  it('honours a caller-supplied initial delay', () => {
    renderBoundary(netError(), { initialRetryDelayMs: 50 })

    gate.fail = false
    act(() => {
      vi.advanceTimersByTime(50)
    })

    expect(screen.getByText('recovered')).toBeTruthy()
  })

  it('does not auto-retry an error that is not retryable', () => {
    // A permission error will not fix itself; retrying it just spins.
    renderBoundary(permError(), { initialRetryDelayMs: 10 })

    gate.fail = false
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.queryByText('recovered')).toBeNull()
  })

  it('gives up after maxAutoRetries', () => {
    renderBoundary(netError(), {
      maxAutoRetries: 1,
      initialRetryDelayMs: 10,
    })

    act(() => {
      vi.advanceTimersByTime(60000)
    })

    expect(screen.queryByText('recovered')).toBeNull()
  })
})
