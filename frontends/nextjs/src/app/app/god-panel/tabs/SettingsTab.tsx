'use client'

import { Typography, Paper } from '@/m3'
import s from './SettingsTab.module.scss'

export function SettingsTab() {
  return (
    <div>
      <Typography variant="h6" gutterBottom>God Panel Settings</Typography>
      <Typography variant="body2" color="text.secondary">
        Configuration for the god-panel build system.
      </Typography>
      <Paper className={s.placeholder}>
        <Typography variant="body2" color="text.secondary">
          Settings are configured via god-panel-config.json (95% data, 5% code).
        </Typography>
      </Paper>
    </div>
  )
}
