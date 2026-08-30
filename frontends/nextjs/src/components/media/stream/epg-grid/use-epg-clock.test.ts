import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

import { useEpgClock } from './use-epg-clock'

describe('useEpgClock', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('computes a window from the current time', () => {
    const { result } = renderHook(() => useEpgClock())
    expect(result.current.windowStart.toISOString()).toBe(
      '2026-01-01T10:00:00.000Z'
    )
  })

  it('advances the window when the clock ticks 30s later', () => {
    const { result, rerender } = renderHook(() => useEpgClock())
    const before = result.current.clock

    vi.advanceTimersByTime(30000)
    rerender()

    expect(result.current.clock).toBeGreaterThan(before)
  })

  it('stops ticking after unmount', () => {
    const { unmount } = renderHook(() => useEpgClock())
    unmount()
    expect(() => vi.advanceTimersByTime(60000)).not.toThrow()
  })
})
