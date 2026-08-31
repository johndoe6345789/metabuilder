'use client'

import { Typography, Paper, Chip } from '@/m3'
import { useTheme } from '@/app/providers'
import s from '../page.module.scss'

export function ThemePanel() {
  const { mode, setMode, resolvedMode } = useTheme()

  return (
    <Paper className={s.panel}>
      <Typography variant="h6" gutterBottom>
        Appearance
      </Typography>
      <div className={s.row}>
        <div>
          <Typography variant="body2">Theme Mode</Typography>
          <Typography variant="caption" color="text.secondary">
            Current: {resolvedMode} (preference: {mode})
          </Typography>
        </div>
        <div className={s.chipRow}>
          {(['light', 'dark', 'system'] as const).map(m => (
            <Chip
              key={m}
              label={m}
              size="small"
              variant={mode === m ? 'filled' : 'outlined'}
              onClick={() => {
                setMode(m)
              }}
              className={s.clickableChip}
            />
          ))}
        </div>
      </div>
    </Paper>
  )
}
