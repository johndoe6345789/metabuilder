import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from '@testing-library/react'

// Unmount-mid-retry cleanup -- split out of RetryableErrorBoundary.test.tsx
// to stay under the 80-line file limit.

import { gate, netError, renderBoundary } from './retryable-error-boundary-test-helpers'

describe('RetryableErrorBoundary unmounting mid-retry', () => {
  beforeEach(() => {
    gate.fail = true
    vi.useFakeTimers()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('cancels its timers', () => {
    const { unmount } = renderBoundary(netError(), {
      initialRetryDelayMs: 100,
    })

    unmount()

    // A setState after unmount would warn through console.error.
    act(() => {
      vi.advanceTimersByTime(10000)
    })
    expect(vi.getTimerCount()).toBe(0)
  })
})
