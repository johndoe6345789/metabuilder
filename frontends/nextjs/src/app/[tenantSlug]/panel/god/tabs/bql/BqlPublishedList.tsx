'use client'

import s from './BqlTab.module.scss'

export interface BqlPublishedListProps {
  /** Routes this script published to, and whether each took. */
  published: { path: string; ok: boolean }[] | undefined
}

/**
 * Where a script's `publish this at ...` lines actually landed. A route
 * that was refused says so here rather than only in the console -- the
 * script reporting "Applied" while the page never went live is exactly the
 * silence that hid the publish bug.
 */
export function BqlPublishedList({ published }: BqlPublishedListProps) {
  return (
    <>
      {published?.map(page => (
        <div
          key={page.path}
          className={page.ok ? s.success : s.errors}
          role="status"
        >
          {page.ok
            ? `✓ Published at ${page.path}`
            : `Could not publish at ${page.path}`}
        </div>
      ))}
    </>
  )
}
