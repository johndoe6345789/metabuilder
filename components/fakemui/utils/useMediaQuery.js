'use client'

/**
 * useMediaQuery - Re-exported from root hooks folder
 *
 * Direct import from root hooks folder bypasses the barrel export
 * to avoid pulling in hooks with project-specific dependencies.
 *
 * Import directly from the hooks folder for new code:
 * import { useMediaQuery } from '@metabuilder/hooks/useMediaQuery'
 */

// Re-export from root hooks folder (direct import, not barrel)
export { useMediaQuery } from '../../../hooks/useMediaQuery'

// Import for use in convenience hooks
import { useMediaQuery } from '../../../hooks/useMediaQuery'

// Convenience hooks for common breakpoints (matching MUI defaults)
const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
}

export function useMediaQueryUp(breakpoint) {
  const width = breakpoints[breakpoint] || breakpoint
  return useMediaQuery(`(min-width: ${width}px)`)
}

export function useMediaQueryDown(breakpoint) {
  const width = breakpoints[breakpoint] || breakpoint
  return useMediaQuery(`(max-width: ${width - 0.05}px)`)
}

export function useMediaQueryBetween(start, end) {
  const startWidth = breakpoints[start] || start
  const endWidth = breakpoints[end] || end
  return useMediaQuery(`(min-width: ${startWidth}px) and (max-width: ${endWidth - 0.05}px)`)
}

export default useMediaQuery
