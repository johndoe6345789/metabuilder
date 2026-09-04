'use client'

import type { ApplyBqlResult } from '../builder/bql/apply'
import s from './BqlTab.module.scss'

export interface BqlResultsPanelProps {
  result: ApplyBqlResult | null
}

/** Nothing partially applies -- either every line resolved and the page
 * changed, or every error is listed together against the line it came from. */
export function BqlResultsPanel({ result }: BqlResultsPanelProps) {
  if (result === null) return null

  if (result.errors.length > 0) {
    return (
      <div className={s.errors} role="alert">
        {result.errors.map((e, i) => (
          <div key={i} className={s.errorRow}>
            <span className={s.errorLine}>Line {e.line}</span>
            {e.message}
          </div>
        ))}
      </div>
    )
  }

  return <div className={s.success}>✓ Applied to the current page.</div>
}
