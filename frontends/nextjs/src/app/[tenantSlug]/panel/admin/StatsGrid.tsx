'use client'

import { Avatar, Paper, Typography } from '@/m3'
import type { EntityStat } from './admin-types'
import s from './page.module.scss'

/** The three headline counts. */
export function StatsGrid({ stats }: { stats: EntityStat[] }) {
  return (
    <div className={s.statsGrid}>
      {stats.map(stat => (
        <Paper key={stat.label} className={s.statCard}>
          <div className={s.statHeader}>
            <Typography variant="body2" color="text.secondary">
              {stat.label}
            </Typography>
            <Avatar className={s.statAvatar}>{stat.icon}</Avatar>
          </div>
          <Typography variant="h5" className={s.statCount}>
            {stat.count}
          </Typography>
        </Paper>
      ))}
    </div>
  )
}
