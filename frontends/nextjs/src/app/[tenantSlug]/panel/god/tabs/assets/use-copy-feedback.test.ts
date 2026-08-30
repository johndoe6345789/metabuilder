import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { useCopyFeedback } from './use-copy-feedback'

beforeEach(() => {
  vi.useFakeTimers()
  Object.assign(navigator, { clipboard: { writeText: vi.fn() } })
})
afterEach(() => vi.useRealTimers())

describe('useCopyFeedback', () => {
  it('starts with nothing copied', () => {
    const { result } = renderHook(() => useCopyFeedback())
    expect(result.current.copiedKey).toBeNull()
  })

  it('writes the given text to the clipboard', () => {
    const { result } = renderHook(() => useCopyFeedback())
    act(() => {
      result.current.copy('a.png', 'https://example.com/a.png')
    })
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'https://example.com/a.png'
    )
  })

  it('marks the key as copied', () => {
    const { result } = renderHook(() => useCopyFeedback())
    act(() => {
      result.current.copy('a.png', 'url')
    })
    expect(result.current.copiedKey).toBe('a.png')
  })

  it('clears the copied key after the feedback window', () => {
    const { result } = renderHook(() => useCopyFeedback())
    act(() => {
      result.current.copy('a.png', 'url')
    })
    act(() => {
      vi.advanceTimersByTime(1600)
    })
    expect(result.current.copiedKey).toBeNull()
  })

  it('does not clear early, before the window elapses', () => {
    const { result } = renderHook(() => useCopyFeedback())
    act(() => {
      result.current.copy('a.png', 'url')
    })
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.copiedKey).toBe('a.png')
  })

  // Copying a second asset before the first one's window elapses must not
  // let the first timer's callback clear the second asset's feedback.
  it('does not clear a newer copy when an older timer fires', () => {
    const { result } = renderHook(() => useCopyFeedback())
    act(() => {
      result.current.copy('a.png', 'url-a')
    })
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    act(() => {
      result.current.copy('b.png', 'url-b')
    })
    act(() => {
      vi.advanceTimersByTime(600)
    })
    expect(result.current.copiedKey).toBe('b.png')
  })
})
