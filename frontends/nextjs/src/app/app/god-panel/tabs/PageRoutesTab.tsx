'use client'

import { Typography, Paper } from '@/m3'
import s from './PageRoutesTab.module.scss'

export function PageRoutesTab() {
  return (
    <div>
      <Typography variant="h6" gutterBottom>Page Routes</Typography>
      <Typography variant="body2" color="text.secondary">
        URL route configuration. Routes map to JSON component trees.
      </Typography>
      <Paper className={s.placeholder}>
        <Typography variant="body2" color="text.secondary">
          Routes stored in the database, loaded by /ui/[[...slug]]/page.tsx.
          Create routes: POST /system/core/page_config
        </Typography>
      </Paper>
    </div>
  )
}
