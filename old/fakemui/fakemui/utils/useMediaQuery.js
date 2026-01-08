import { useState, useEffect, useCallback } from 'react'

/**
 * useMediaQuery - React hook for CSS media queries
 * @param {string} query - Media query string (e.g., '(min-width: 600px)')
 * @param {object} options - Options object
 * @returns {boolean} - Whether the media query matches
 */
export function useMediaQuery(query, options = {}) {
  const {
    defaultMatches = false,
    matchOnSSR = defaultMatches,
    noSsr = false,
  } = options

  const getMatches = useCallback(() => {
    // For SSR, return the default
    if (typeof window === 'undefined') {
      return matchOnSSR
    }
    return window.matchMedia(query).matches
  }, [query, matchOnSSR])

  const [matches, setMatches] = useState(() => {
    if (noSsr) {
      return getMatches()
    }
    return defaultMatches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQueryList = window.matchMedia(query)
    
    // Set initial value
    setMatches(mediaQueryList.matches)

    // Create event listener
    const listener = (event) => {
      setMatches(event.matches)
    }

    // Add listener (modern browsers use addEventListener)
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', listener)
    } else {
      // Fallback for older browsers
      mediaQueryList.addListener(listener)
    }

    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', listener)
      } else {
        mediaQueryList.removeListener(listener)
      }
    }
  }, [query])

  return matches
}

// Convenience hooks for common breakpoints (matching MUI defaults)
export function useMediaQueryUp(breakpoint) {
  const breakpoints = {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  }
  const width = breakpoints[breakpoint] || breakpoint
  return useMediaQuery(`(min-width: ${width}px)`)
}

export function useMediaQueryDown(breakpoint) {
  const breakpoints = {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  }
  const width = breakpoints[breakpoint] || breakpoint
  return useMediaQuery(`(max-width: ${width - 0.05}px)`)
}

export function useMediaQueryBetween(start, end) {
  const breakpoints = {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  }
  const startWidth = breakpoints[start] || start
  const endWidth = breakpoints[end] || end
  return useMediaQuery(`(min-width: ${startWidth}px) and (max-width: ${endWidth - 0.05}px)`)
}

export default useMediaQuery
