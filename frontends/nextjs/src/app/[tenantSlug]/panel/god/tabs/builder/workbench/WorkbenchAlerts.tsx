'use client'

import s from '../ComponentTreeTab.module.scss'

export interface WorkbenchAlertsProps {
  /** Set when publishing took a route over from a package. */
  conflict: string | null
  /** Set when the server refused the last publish, in its own words. */
  publishError: string | null
  /** True when the list of published routes could not be read. */
  pagesUnreachable?: boolean
}

/**
 * The ways the published page can differ from what the builder shows: a
 * route taken over from a package, a publish the server rejected, and a
 * route list that could not be read at all. All belong above the publish
 * bar, because each means the thing on screen is not the thing that is
 * live -- the last most of all, since an unread list looks exactly like an
 * empty one and invites publishing over something.
 */
export function WorkbenchAlerts({
  conflict,
  publishError,
  pagesUnreachable = false,
}: WorkbenchAlertsProps) {
  return (
    <>
      {pagesUnreachable && (
        <div className={s.publishError} role="alert">
          Could not read this community&rsquo;s published routes. The list
          below is empty because nothing answered, not because nothing is
          published — publishing now may take over a page that is live.
        </div>
      )}

      {conflict !== null && (
        <div className={s.conflict} role="alert">
          {conflict}
        </div>
      )}

      {publishError !== null && (
        <div className={s.publishError} role="alert">
          Publish failed — {publishError}
        </div>
      )}
    </>
  )
}
