import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { useStreamHub } from './use-stream-hub'

describe('useStreamHub', () => {
  it('starts on the TV section with no watch trigger', () => {
    const { result } = renderHook(() => useStreamHub())
    expect(result.current.active).toBe('tv')
    expect(result.current.watchTrigger).toBeNull()
  })

  it('switches sections via setActive', () => {
    const { result } = renderHook(() => useStreamHub())
    act(() => result.current.setActive('radio'))
    expect(result.current.active).toBe('radio')
  })

  it('jumps to the TV tab and sets a watch trigger from the hero', () => {
    const { result } = renderHook(() => useStreamHub())
    act(() => result.current.setActive('retro'))
    act(() => result.current.handleHeroWatch('c1'))
    expect(result.current.active).toBe('tv')
    expect(result.current.watchTrigger?.channelId).toBe('c1')
  })

  it('gives each watch trigger a fresh nonce', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useStreamHub())
    act(() => result.current.handleHeroWatch('c1'))
    const first = result.current.watchTrigger?.nonce
    vi.advanceTimersByTime(1)
    act(() => result.current.handleHeroWatch('c1'))
    expect(result.current.watchTrigger?.nonce).not.toBe(first)
    vi.useRealTimers()
  })
})
