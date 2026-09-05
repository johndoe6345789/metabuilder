'use client'

import type { PublishOutcome } from './use-bql-tab'
import s from './BqlTab.module.scss'

export interface BqlPublishedListProps {
  published: PublishOutcome[] | undefined
}

/**
 * Where a script's `publish this at ...` lines actually landed.
 *
 * A refusal shows the server's own words. "Could not publish" on its own
 * sent me to the browser's network tab to discover a 429; the reason was
 * available the whole time and simply had nowhere to go.
 */
export function BqlPublishedList({ published }: BqlPublishedListProps) {
  return (
    <>
      {published?.map(page => (
        <div
          key={page.path}
          className={page.reason === null ? s.success : s.errors}
          role="status"
        >
          {page.reason === null
            ? `✓ Published at ${page.path}`
            : `Could not publish at ${page.path} — ${page.reason}`}
        </div>
      ))}
    </>
  )
}
