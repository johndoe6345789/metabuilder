/**
 * useWindowSize Hook
 * Tracks browser window dimensions with resize listener
 */

import { useState, useEffect } from 'react'

export interface WindowSize {
  width: number
  height: number
}

export interface UseWindowSizeReturn {
  width: number
  height: number
  isSmall: boolean
  isMedium: boolean
  isLarge: boolean
}

/**
 * Hook to track window dimensions
 *
 * @example
 * const { width, height, isSmall } = useWindowSize();
 */
export function useWindowSize(): UseWindowSizeReturn {
  const [size, setSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    width: size.width,
    height: size.height,
    isSmall: size.width < 768,
    isMedium: size.width >= 768 && size.width < 1024,
    isLarge: size.width >= 1024,
  }
}
