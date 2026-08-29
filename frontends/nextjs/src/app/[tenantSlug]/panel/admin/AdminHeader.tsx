'use client'

import { Divider, TextField, Typography } from '@/m3'
import s from './page.module.scss'

export interface AdminHeaderProps {
  search: string
  onSearchChange: (value: string) => void
}

/** The panel's title, and the filter that narrows the table below it. */
export function AdminHeader({ search, onSearchChange }: AdminHeaderProps) {
  return (
    <>
      <div className={s.tableHeader}>
        <div>
          <Typography variant="h6">Models</Typography>
          <Typography variant="body2" color="text.secondary">
            Browse and manage data models
          </Typography>
        </div>
        <TextField
          placeholder="Search..."
          value={search}
          onChange={e => {
            onSearchChange(e.target.value)
          }}
          size="small"
          className={s.search}
        />
      </div>
      <Divider />
    </>
  )
}
