import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSaveIndicator } from './use-save-indicator'

describe('useSaveIndicator', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns empty timeAgo when lastSaved is null', () => {
    const { result } = renderHook(() => useSaveIndicator(null))
    expect(result.current.timeAgo).toBe('')
    expect(result.current.isRecent).toBe(false)
  })

  it('isRecent is true when saved within recentThresholdMs', () => {
    const now = Date.now()
    const { result } = renderHook(() => useSaveIndicator(now, { recentThresholdMs: 5000 }))
    expect(result.current.isRecent).toBe(true)
  })

  it('isRecent is false when saved longer ago than recentThresholdMs', () => {
    const savedAt = Date.now() - 10000 // 10 seconds ago
    const { result } = renderHook(() => useSaveIndicator(savedAt, { recentThresholdMs: 3000 }))
    expect(result.current.isRecent).toBe(false)
  })

  it('timeAgo is non-empty when lastSaved is set', () => {
    const { result } = renderHook(() => useSaveIndicator(Date.now()))
    expect(result.current.timeAgo).toBeTruthy()
  })

  it('updates timeAgo on interval', () => {
    const { result } = renderHook(() =>
      useSaveIndicator(Date.now() - 5000, { intervalMs: 1000 })
    )
    const initialTimeAgo = result.current.timeAgo

    act(() => {
      vi.advanceTimersByTime(61000) // advance 1 minute
    })

    // After a minute, the time-ago string should change
    expect(result.current.timeAgo).toBeTruthy()
  })

  it('clears interval on unmount (no error thrown)', () => {
    const { unmount } = renderHook(() => useSaveIndicator(Date.now()))
    expect(() => {
      unmount()
      vi.advanceTimersByTime(30000)
    }).not.toThrow()
  })

  it('resets when lastSaved changes to null', () => {
    let lastSaved: number | null = Date.now()
    const { result, rerender } = renderHook(
      ({ ls }) => useSaveIndicator(ls),
      { initialProps: { ls: lastSaved } }
    )
    expect(result.current.timeAgo).toBeTruthy()

    rerender({ ls: null })
    expect(result.current.timeAgo).toBe('')
    expect(result.current.isRecent).toBe(false)
  })
})
