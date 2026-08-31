'use client'

import s from '../RadioSection.module.scss'

export function EmptyStationsNotice() {
  return (
    <div className={s.status}>
      No stations yet — create one via <code>POST /api/radio/channels</code>{' '}
      and set a playlist via <code>PUT .../playlist</code>.
    </div>
  )
}
