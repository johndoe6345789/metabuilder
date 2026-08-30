'use client'

import s from '../LiveTvSection.module.scss'

export function EmptyChannelsNotice() {
  return (
    <div className={s.status}>
      No channels yet — create one via <code>POST /api/tv/channels</code> and
      schedule a program via <code>PUT .../schedule</code>.
    </div>
  )
}
