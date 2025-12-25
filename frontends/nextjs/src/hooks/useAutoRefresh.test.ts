/**
 * Tests for useAutoRefresh hook - Auto-refresh polling management
 * Following parameterized test pattern per project conventions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAutoRefresh } from './useAutoRefresh'

describe('useAutoRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it.each([
      { enabled: false, expectAutoRefreshing: false },
      { enabled: true, expectAutoRefreshing: true },
      { enabled: undefined, expectAutoRefreshing: false },
    ])('should initialize with enabled=$enabled -> isAutoRefreshing=$expectAutoRefreshing', ({ enabled, expectAutoRefreshing }) => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)

      const { result } = renderHook(() =>
        useAutoRefresh({
          intervalMs: 30000,
          onRefresh,
          enabled,
        })
      )

      expect(result.current.isAutoRefreshing).toBe(expectAutoRefreshing)
    })

    it.each([
      { intervalMs: 30000, expectedSeconds: 30 },
      { intervalMs: 60000, expectedSeconds: 60 },
      { intervalMs: 5000, expectedSeconds: 5 },
    ])('should set secondsUntilNextRefresh from intervalMs=$intervalMs', ({ intervalMs, expectedSeconds }) => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)

      const { result } = renderHook(() =>
        useAutoRefresh({
          intervalMs,
          onRefresh,
          enabled: false,
        })
      )

      expect(result.current.secondsUntilNextRefresh).toBe(expectedSeconds)
    })
  })

  describe('toggleAutoRefresh', () => {
    it('should toggle from disabled to enabled', () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)

      const { result } = renderHook(() =>
        useAutoRefresh({
          intervalMs: 30000,
          onRefresh,
          enabled: false,
        })
      )

      expect(result.current.isAutoRefreshing).toBe(false)

      act(() => {
        result.current.toggleAutoRefresh()
      })

      expect(result.current.isAutoRefreshing).toBe(true)
    })

    it('should toggle from enabled to disabled', () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)

      const { result } = renderHook(() =>
        useAutoRefresh({
          intervalMs: 30000,
          onRefresh,
          enabled: true,
        })
      )

      expect(result.current.isAutoRefreshing).toBe(true)

      act(() => {
        result.current.toggleAutoRefresh()
      })

      expect(result.current.isAutoRefreshing).toBe(false)
    })
  })

  describe('setEnabled', () => {
    it.each([
      { initial: false, setTo: true, expected: true },
      { initial: true, setTo: false, expected: false },
      { initial: false, setTo: false, expected: false },
      { initial: true, setTo: true, expected: true },
    ])('should set from $initial to $setTo', ({ initial, setTo, expected }) => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)

      const { result } = renderHook(() =>
        useAutoRefresh({
          intervalMs: 30000,
          onRefresh,
          enabled: initial,
        })
      )

      act(() => {
        result.current.setEnabled(setTo)
      })

      expect(result.current.isAutoRefreshing).toBe(expected)
    })
  })

  describe('refresh timing', () => {
    it('should call onRefresh after intervalMs when enabled', async () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)

      renderHook(() =>
        useAutoRefresh({
          intervalMs: 5000,
          onRefresh,
          enabled: true,
        })
      )

      // Not called initially
      expect(onRefresh).not.toHaveBeenCalled()

      // Advance to just before interval
      act(() => {
        vi.advanceTimersByTime(4999)
      })
      expect(onRefresh).not.toHaveBeenCalled()

      // Advance past interval
      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(onRefresh).toHaveBeenCalledTimes(1)
    })

    it('should not call onRefresh when disabled', () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)

      renderHook(() =>
        useAutoRefresh({
          intervalMs: 5000,
          onRefresh,
          enabled: false,
        })
      )

      act(() => {
        vi.advanceTimersByTime(10000)
      })

      expect(onRefresh).not.toHaveBeenCalled()
    })

    it('should call onRefresh multiple times at interval', () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)

      renderHook(() =>
        useAutoRefresh({
          intervalMs: 5000,
          onRefresh,
          enabled: true,
        })
      )

      act(() => {
        vi.advanceTimersByTime(15000) // 3 intervals
      })

      expect(onRefresh).toHaveBeenCalledTimes(3)
    })
  })

  describe('countdown', () => {
    it('should decrement countdown every second when enabled', () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)

      const { result } = renderHook(() =>
        useAutoRefresh({
          intervalMs: 5000,
          onRefresh,
          enabled: true,
        })
      )

      expect(result.current.secondsUntilNextRefresh).toBe(5)

      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(result.current.secondsUntilNextRefresh).toBe(4)

      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(result.current.secondsUntilNextRefresh).toBe(3)
    })

    it('should reset countdown after reaching zero', () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)

      const { result } = renderHook(() =>
        useAutoRefresh({
          intervalMs: 3000,
          onRefresh,
          enabled: true,
        })
      )

      expect(result.current.secondsUntilNextRefresh).toBe(3)

      // Advance 3 seconds to reach zero
      act(() => {
        vi.advanceTimersByTime(3000)
      })

      // Should reset to initial value
      expect(result.current.secondsUntilNextRefresh).toBe(3)
    })
  })

  describe('cleanup', () => {
    it('should stop refresh when disabled after being enabled', () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)

      const { result } = renderHook(() =>
        useAutoRefresh({
          intervalMs: 5000,
          onRefresh,
          enabled: true,
        })
      )

      // Advance half interval
      act(() => {
        vi.advanceTimersByTime(2500)
      })

      // Disable
      act(() => {
        result.current.setEnabled(false)
      })

      // Advance another full interval
      act(() => {
        vi.advanceTimersByTime(10000)
      })

      // Should not have been called (disabled before first interval completed)
      expect(onRefresh).not.toHaveBeenCalled()
    })
  })
})
