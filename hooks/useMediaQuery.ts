/**
 * useMediaQuery Hook
 * Tracks CSS media query state for responsive design and feature detection
 *
 * Features:
 * - Real-time media query matching
 * - Support for single or multiple queries
 * - Automatic listener cleanup
 * - SSR-safe with initial state
 * - Useful for responsive layouts and feature detection
 *
 * @example
 * // Single query
 * const isMobile = useMediaQuery('(max-width: 767px)')
 * const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
 * const isLandscape = useMediaQuery('(orientation: landscape)')
 *
 * return (
 *   <div>
 *     {isMobile && <MobileMenu />}
 *     {!isMobile && <DesktopMenu />}
 *   </div>
 * )
 *
 * @example
 * // Multiple queries
 * const { mobile, tablet, desktop } = useMediaQuery({
 *   mobile: '(max-width: 639px)',
 *   tablet: '(min-width: 640px) and (max-width: 1023px)',
 *   desktop: '(min-width: 1024px)',
 * })
 *
 * if (mobile) return <MobileLayout />
 * if (tablet) return <TabletLayout />
 * return <DesktopLayout />
 *
 * @example
 * // Accessibility features
 * const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
 * const prefersLightMode = useMediaQuery('(prefers-color-scheme: light)')
 *
 * if (prefersReducedMotion) {
 *   // Disable animations
 * }
 */

import { useState, useEffect, useCallback } from 'react'

export type UseMediaQueryInput = string | Record<string, string>

export type UseMediaQueryReturn<T extends UseMediaQueryInput> = T extends string ? boolean : Record<string, boolean>

export function useMediaQuery<T extends UseMediaQueryInput>(query: T): UseMediaQueryReturn<T> {
  // Handle single string query
  if (typeof query === 'string') {
    const [matches, setMatches] = useState<boolean>(() => {
      // SSR-safe check
      if (typeof window === 'undefined') {
        return false
      }
      try {
        return window.matchMedia(query).matches
      } catch {
        return false
      }
    })

    useEffect(() => {
      if (typeof window === 'undefined') return

      try {
        const mediaQueryList = window.matchMedia(query)

        // Update initial state
        setMatches(mediaQueryList.matches)

        // Create listener - supports both new and old API
        const handleChange = (e: MediaQueryListEvent | Event) => {
          if (e instanceof MediaQueryListEvent) {
            setMatches(e.matches)
          } else if ('matches' in e.target!) {
            setMatches((e.target as MediaQueryList).matches)
          }
        }

        // Use addEventListener (modern API)
        mediaQueryList.addEventListener('change', handleChange)

        return () => {
          mediaQueryList.removeEventListener('change', handleChange)
        }
      } catch {
        // Handle invalid queries
        return undefined
      }
    }, [query])

    return matches as UseMediaQueryReturn<T>
  }

  // Handle multiple queries as object
  const [queryMatches, setQueryMatches] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    if (typeof window === 'undefined') {
      Object.keys(query).forEach((key) => {
        initial[key] = false
      })
      return initial
    }

    try {
      Object.entries(query).forEach(([key, mediaQuery]) => {
        initial[key] = window.matchMedia(mediaQuery).matches
      })
    } catch {
      Object.keys(query).forEach((key) => {
        initial[key] = false
      })
    }

    return initial
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQueryLists: Array<{ key: string; mql: MediaQueryList }> = []

    try {
      Object.entries(query).forEach(([key, mediaQuery]) => {
        const mql = window.matchMedia(mediaQuery)
        mediaQueryLists.push({ key, mql })

        // Update initial state
        setQueryMatches((prev) => ({
          ...prev,
          [key]: mql.matches,
        }))
      })
    } catch {
      return undefined
    }

    const handleChange = (key: string) => (e: MediaQueryListEvent | Event) => {
      if (e instanceof MediaQueryListEvent) {
        setQueryMatches((prev) => ({
          ...prev,
          [key]: e.matches,
        }))
      } else if ('matches' in e.target!) {
        setQueryMatches((prev) => ({
          ...prev,
          [key]: (e.target as MediaQueryList).matches,
        }))
      }
    }

    mediaQueryLists.forEach(({ key, mql }) => {
      const handler = handleChange(key)
      mql.addEventListener('change', handler)
    })

    return () => {
      mediaQueryLists.forEach(({ mql, key }) => {
        mql.removeEventListener('change', handleChange(key))
      })
    }
  }, [query])

  return queryMatches as UseMediaQueryReturn<T>
}
