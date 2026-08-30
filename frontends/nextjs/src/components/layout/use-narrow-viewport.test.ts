import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

import { isNarrowViewport, NARROW_QUERY, useNarrowViewport } from './use-narrow-viewport'

/** A minimal matchMedia double whose 'change' listener we can fire. */
const fakeMedia = (matches: boolean) => {
  const listeners = new Set<(e: MediaQueryListEvent) => void>()
  const mq = {
    matches,
    media: NARROW_QUERY,
    addEventListener: (_type: string, fn: (e: MediaQueryListEvent) => void) => {
      listeners.add(fn)
    },
    removeEventListener: (
      _type: string,
      fn: (e: MediaQueryListEvent) => void
    ) => {
      listeners.delete(fn)
    },
  }
  const fire = (next: boolean) => {
    mq.matches = next
    for (const fn of listeners) fn({ matches: next } as MediaQueryListEvent)
  }
  return { mq, fire, listenerCount: () => listeners.size }
}

describe('useNarrowViewport', () => {
  it('reports the current state immediately, on mount', () => {
    const { mq } = fakeMedia(true)
    vi.stubGlobal('matchMedia', vi.fn(() => mq))
    const onChange = vi.fn()
    renderHook(() => {
      useNarrowViewport(onChange)
    })
    expect(onChange).toHaveBeenCalledWith(true)
    vi.unstubAllGlobals()
  })

  it('reports every later crossing', () => {
    const { mq, fire } = fakeMedia(false)
    vi.stubGlobal('matchMedia', vi.fn(() => mq))
    const onChange = vi.fn()
    renderHook(() => {
      useNarrowViewport(onChange)
    })
    fire(true)
    expect(onChange).toHaveBeenLastCalledWith(true)
    fire(false)
    expect(onChange).toHaveBeenLastCalledWith(false)
    vi.unstubAllGlobals()
  })

  it('removes its listener on unmount', () => {
    const { mq, listenerCount } = fakeMedia(false)
    vi.stubGlobal('matchMedia', vi.fn(() => mq))
    const { unmount } = renderHook(() => {
      useNarrowViewport(vi.fn())
    })
    expect(listenerCount()).toBe(1)
    unmount()
    expect(listenerCount()).toBe(0)
    vi.unstubAllGlobals()
  })
})

describe('isNarrowViewport', () => {
  it('reads the query at call time', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))
    expect(isNarrowViewport()).toBe(true)
    vi.unstubAllGlobals()
  })
})
