'use client'

import { useState } from 'react'
import { Paper, Typography } from '@/m3'
import { AdminHeader } from './AdminHeader'
import { AdminTabs } from './AdminTabs'
import { ConfirmDeleteUser } from './ConfirmDeleteUser'
import { StatsGrid } from './StatsGrid'
import { UsersTable } from './UsersTable'
import { matchesSearch, type UserRecord } from './admin-types'
import { useAdminData } from './use-admin-data'
import s from './page.module.scss'

/** Django-style data management: who has an account, and how many rows. */
export function AdminContent() {
  const data = useAdminData()
  const [activeTab, setActiveTab] = useState(0)
  const [search, setSearch] = useState('')
  const [pending, setPending] = useState<UserRecord | null>(null)

  const visible = data.users.filter(u => matchesSearch(u, search))
  const unreachable = data.status === 'unreachable'

  return (
    <div className={s.root}>
      <div className={s.header}>
        <Typography variant="h4" gutterBottom>
          Data Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage all application data and users
        </Typography>
      </div>

      {unreachable && (
        <Typography variant="body2" color="error">
          The data layer is unreachable, so no accounts can be listed. This
          is not an empty user table.
        </Typography>
      )}

      <StatsGrid stats={data.stats} />

      <Paper className={s.tablePanel}>
        <AdminHeader search={search} onSearchChange={setSearch} />
        <AdminTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          userCount={data.users.length}
          commentCount={data.commentCount}
        >
          <UsersTable
            users={visible}
            emptyMessage={
              unreachable ? 'Could not load accounts' : 'No users found'
            }
            onDelete={setPending}
          />
        </AdminTabs>
      </Paper>

      <ConfirmDeleteUser
        user={pending}
        onCancel={() => {
          setPending(null)
        }}
        onConfirm={() => {
          const target = pending
          setPending(null)
          if (target !== null) void data.removeUser(target.id)
        }}
      />
    </div>
  )
}
