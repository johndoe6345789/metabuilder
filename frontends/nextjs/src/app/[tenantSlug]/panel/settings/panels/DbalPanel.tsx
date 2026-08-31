'use client'

import { Typography, Paper } from '@/m3'
import s from '../page.module.scss'

export function DbalPanel() {
  return (
    <Paper className={s.panel}>
      <Typography variant="h6" gutterBottom>
        DBAL Connection
      </Typography>
      <Typography variant="body2" color="text.secondary" className={s.dbalUrl}>
        API URL:{' '}
        {process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Data is persisted client-side via Redux + redux-persist (IndexedDB).
        Server data fetched from DBAL C++ daemon REST API.
      </Typography>
    </Paper>
  )
}
