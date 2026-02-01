/**
 * useWindowSize Hook
 * Tracks browser window width and height with automatic resize listener
 *
 * Features:
 * - Real-time window size tracking
 * - Automatic cleanup on unmount
 * - Memoized resize handler via useCallback
 * - Initial size from window object
 *
 * @example
 * const { width, height } = useWindowSize()
 *
 * return (
 *   <div>
 *     Window size: {width} x {height}
 *     {width < 768 && <MobileLayout />}
 *     {width >= 768 && <DesktopLayout />}
 *   </div>
 * )
 *
 * @example
 * // With responsive threshold
 * const { width, height } = useWindowSize()
 * const isMobile = width < 768
 * const isTablet = width >= 768 && width < 1024
 * const isDesktop = width >= 1024
 */

import { useState, useEffect, useCallback } from 'react'

export interface WindowSize {
  /** Current window width in pixels */
  width: number
  /** Current window height in pixels */
  height: number
}

export interface UseWindowSizeReturn extends WindowSize {}

export function useWindowSize(): UseWindowSizeReturn {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  // Memoized resize handler
  const handleResize = useCallback(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })
  }, [])

  useEffect(() => {
    // Set initial size from window
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    // Add resize listener
    window.addEventListener('resize', handleResize)

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [handleResize])

  return windowSize
}
