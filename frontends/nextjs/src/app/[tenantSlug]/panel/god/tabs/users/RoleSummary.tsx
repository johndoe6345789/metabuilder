'use client'

import { Chip } from '@/m3'
import s from '../UsersTab.module.scss'

/** How many users hold each role, as a row of chips. */
export function RoleSummary({ counts }: { counts: Record<string, number> }) {
  return (
    <div className={s.summary}>
      {Object.entries(counts).map(([role, count]) => (
        <Chip key={role} label={`${role}: ${count}`} size="small" />
      ))}
    </div>
  )
}
