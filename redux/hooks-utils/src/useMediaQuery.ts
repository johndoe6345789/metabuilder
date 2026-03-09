/**
 * useMediaQuery Hook
 * Reactive CSS media query matching
 */

import { useState, useEffect } from 'react'

export type UseMediaQueryInput = string

export interface UseMediaQueryReturn {
  matches: boolean
}

/**
 * Hook to track CSS media query matches
 *
 * @example
 * const { matches: isDark } = useMediaQuery('(prefers-color-scheme: dark)');
 * const { matches: isMobile } = useMediaQuery('(max-width: 768px)');
 */
export function useMediaQuery(query: UseMediaQueryInput): UseMediaQueryReturn {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Set initial value
    setMatches(mediaQuery.matches)

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])

  return { matches }
}
