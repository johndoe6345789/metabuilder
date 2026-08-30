'use client'

import { Button, TextField, Typography } from '@/m3'
import s from '../PackageManager.module.scss'

export interface PackageManagerToolbarProps {
  newName: string
  showArchived: boolean
  onNewNameChange: (value: string) => void
  onCreate: () => void
  onToggleArchived: () => void
}

/** The title bar: name a package, create it, or flip to the archive. */
export function PackageManagerToolbar(props: PackageManagerToolbarProps) {
  return (
    <div className={s.bar}>
      <Typography variant="h6">Your Packages</Typography>
      <span className={s.spacer} />
      <TextField
        size="small"
        label="New package name"
        value={props.newName}
        onChange={e => {
          props.onNewNameChange(e.target.value)
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') props.onCreate()
        }}
      />
      <Button variant="contained" size="small" onClick={props.onCreate}>
        + Create
      </Button>
      <Button variant="text" size="small" onClick={props.onToggleArchived}>
        {props.showArchived ? 'Show active' : 'Show archived'}
      </Button>
    </div>
  )
}
