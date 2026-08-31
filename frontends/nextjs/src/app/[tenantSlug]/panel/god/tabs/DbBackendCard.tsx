'use client'

import { Typography } from '@/m3'
import type { DbBackend } from './db-backends'
import s from './DatabaseTab.module.scss'

export interface DbBackendCardProps {
  db: DbBackend
  selected: boolean
  onSelect: (db: DbBackend) => void
}

export function DbBackendCard({ db, selected, onSelect }: DbBackendCardProps) {
  return (
    <button
      type="button"
      className={`${s.backend} ${selected ? s.selected : ''}`}
      onClick={() => {
        onSelect(db)
      }}
    >
      <Typography variant="subtitle2">{db.name}</Typography>
      <Typography variant="caption" color="text.secondary">
        {db.desc}
      </Typography>
    </button>
  )
}
