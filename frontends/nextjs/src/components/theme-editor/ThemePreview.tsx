'use client'

import { Typography, Button, Paper } from '@/m3'
import s from './ThemePreview.module.scss'

/** Live preview panel — all colours come from CSS vars so they update instantly */
export function ThemePreview() {
  return (
    <Paper className={s.panel} variant="outlined">
      <Typography variant="subtitle2" className={s.heading}>
        Live Preview
      </Typography>

      <div className={s.buttonRow}>
        <Button variant="contained" size="small">Primary</Button>
        <Button variant="outlined" size="small">Outlined</Button>
        <Button
          variant="contained"
          size="small"
          className={s.secondaryBtn}
        >
          Secondary
        </Button>
      </div>

      <div className={s.card}>
        <Typography variant="body2" className={s.cardText}>
          Surface container card
        </Typography>
        <Typography variant="caption" className={s.cardSub}>
          on-surface-container text example
        </Typography>
      </div>

      <Typography variant="caption" className={s.errorText}>
        Error state example
      </Typography>
    </Paper>
  )
}
