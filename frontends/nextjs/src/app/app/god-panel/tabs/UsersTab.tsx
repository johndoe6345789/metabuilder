'use client'

import { Typography, Paper } from '@/m3'
import s from './UsersTab.module.scss'

export function UsersTab() {
  return (
    <div>
      <Typography variant="h6" gutterBottom>User Management</Typography>
      <Typography variant="body2" color="text.secondary">
        Role hierarchy: user → moderator → admin → god → supergod
      </Typography>
      <Paper className={s.placeholder}>
        <Typography variant="body2" color="text.secondary">
          User management is available in the Admin Panel. This tab provides
          advanced role assignment and multi-tenant user configuration.
        </Typography>
      </Paper>
    </div>
  )
}
