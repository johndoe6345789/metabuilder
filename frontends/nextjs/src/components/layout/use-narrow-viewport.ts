'use client'

import { useEffect } from 'react'

/** Below this the sidebar is an overlay drawer rather than a column.
 *  Kept in sync with the same breakpoint in AppShell.module.scss. */
export const NARROW_QUERY = '(max-width: 899px)'

/**
 * Runs `onChange` with the current narrow/wide state, immediately and on
 * every breakpoint crossing.
 *
 * The open/closed state used to be decided once, at mount. Resizing the
 * window never re-ran it, so loading wide and then narrowing left a 288px
 * sidebar pinned over a window that no longer had room for it.
 */
export function useNarrowViewport(onChange: (narrow: boolean) => void): void {
  useEffect(() => {
    const mq = window.matchMedia(NARROW_QUERY)
    onChange(mq.matches)
    const listener = (event: MediaQueryListEvent): void => {
      onChange(event.matches)
    }
    mq.addEventListener('change', listener)
    return () => {
      mq.removeEventListener('change', listener)
    }
  }, [onChange])
}

/** Whether the viewport is narrow right now, read at call time. */
export function isNarrowViewport(): boolean {
  return window.matchMedia(NARROW_QUERY).matches
}
