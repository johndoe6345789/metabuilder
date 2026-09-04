'use client'

import s from '../ComponentTreeTab.module.scss'

export interface WorkbenchAlertsProps {
  /** Set when publishing took a route over from a package. */
  conflict: string | null
  /** Set when the server refused the last publish, in its own words. */
  publishError: string | null
}

/**
 * The two ways the published page can differ from what the builder shows:
 * a route taken over from a package, and a publish the server rejected.
 * Both belong above the publish bar, because both mean the thing on screen
 * is not the thing that is live.
 */
export function WorkbenchAlerts({
  conflict,
  publishError,
}: WorkbenchAlertsProps) {
  return (
    <>
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
