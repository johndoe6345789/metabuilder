'use client'

/**
 * useMediaQuery - Re-exported from @metabuilder/hooks
 *
 * BACKWARD COMPATIBILITY: This file re-exports from @metabuilder/hooks
 * for consumers still importing from @metabuilder/fakemui.
 *
 * Prefer importing directly from @metabuilder/hooks:
 * import { useMediaQuery } from '@metabuilder/hooks'
 */

// Re-export from hooks package (which has a more comprehensive TypeScript implementation)
export { useMediaQuery } from '@metabuilder/hooks'

// Convenience hooks for common breakpoints (matching MUI defaults)
// These are kept here for backward compatibility - they use the hooks version internally
import { useMediaQuery } from '@metabuilder/hooks'

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
