import type { CSSProperties } from 'react'
import type { CategoryColors } from './error-boundary-presentation'

/** The card chrome around the whole fallback -- pulled out so the
 *  component itself reads as layout, not inline style bookkeeping. */
export function fallbackWrapperStyle(colors: CategoryColors): CSSProperties {
  return {
    padding: '24px',
    margin: '16px',
    border: `1px solid ${colors.border}`,
    borderRadius: '1.25rem',
    backgroundColor: colors.bg,
    boxShadow: `0 2px 4px rgba(0, 0, 0, 0.05)`,
  }
}
