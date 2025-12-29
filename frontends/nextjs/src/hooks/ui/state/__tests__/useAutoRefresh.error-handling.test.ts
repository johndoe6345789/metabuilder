/**
 * Auto-refresh error-handling tests
 */
import { act,renderHook } from '@testing-library/react'
import { afterEach,beforeEach, describe, expect, it, vi } from 'vitest'

import { useAutoRefresh } from '../useAutoRefresh'

describe('useAutoRefresh error handling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('stops refresh when disabled after being enabled', () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useAutoRefresh({
        intervalMs: 5000,
        onRefresh,
        enabled: true,
      })
    )

    act(() => {
      vi.advanceTimersByTime(2500)
    })

    act(() => {
      result.current.setEnabled(false)
    })

    act(() => {
      vi.advanceTimersByTime(10000)
    })

    expect(onRefresh).not.toHaveBeenCalled()
  })

  it('continues scheduling refreshes after onRefresh errors', () => {
    const erroringRefresh = vi
      .fn()
      .mockImplementation(() => Promise.reject(new Error('refresh failed')).catch(() => {}))

    const { result } = renderHook(() =>
      useAutoRefresh({
        intervalMs: 2000,
        onRefresh: erroringRefresh,
        enabled: true,
      })
    )

    expect(result.current.secondsUntilNextRefresh).toBe(2)

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(erroringRefresh).toHaveBeenCalledTimes(1)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.secondsUntilNextRefresh).toBe(1)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.secondsUntilNextRefresh).toBe(2)
    expect(erroringRefresh).toHaveBeenCalledTimes(2)
  })
})
