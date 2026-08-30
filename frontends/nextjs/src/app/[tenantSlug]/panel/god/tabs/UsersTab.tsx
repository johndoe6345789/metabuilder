'use client'

import { Alert, Typography } from '@/m3'
import { RoleSummary } from './users/RoleSummary'
import { UsersTable } from './users/UsersTable'
import { UsersToolbar } from './users/UsersToolbar'
import { useUsersTab } from './use-users-tab'
import s from './UsersTab.module.scss'

export function UsersTab() {
  const tab = useUsersTab()

  return (
    <div className={s.root}>
      <Typography variant="h6" gutterBottom>
        User Management
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Role hierarchy: user → moderator → admin → god → supergod
      </Typography>

      <UsersToolbar query={tab.query} onQueryChange={tab.setQuery} />

      {tab.error !== null && (
        <Alert severity="warning">User API unavailable: {tab.error}</Alert>
      )}

      <RoleSummary counts={tab.roleCounts} />
      <UsersTable users={tab.filtered} loading={tab.loading} />
    </div>
  )
}
