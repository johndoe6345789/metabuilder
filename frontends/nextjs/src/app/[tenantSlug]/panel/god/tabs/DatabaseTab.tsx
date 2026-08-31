'use client'

import { useState } from 'react'
import { Typography, Paper, Button, Chip, Alert } from '@/m3'
import { DB_BACKENDS, DEFAULT_BACKEND } from './db-backends'
import { useDbalHealth } from './use-dbal-health'
import { DbBackendCard } from './DbBackendCard'
import s from './DatabaseTab.module.scss'

export function DatabaseTab() {
  const [selected, setSelected] = useState(DEFAULT_BACKEND)
  const { status, message, refresh } = useDbalHealth()

  return (
    <div className={s.root}>
      <Typography variant="h6" gutterBottom>
        Database Management
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {DB_BACKENDS.length} backend adapters. Select one to inspect the
        required runtime configuration.
      </Typography>
      <div className={s.statusBar}>
        <Chip
          label={`DBAL ${status}`}
          size="small"
          color={status === 'online' ? 'success' : undefined}
          variant={status === 'checking' ? 'outlined' : undefined}
        />
        <Button size="small" variant="outlined" onClick={refresh}>
          Refresh
        </Button>
      </div>
      {message !== null && <Alert severity="warning">{message}</Alert>}
      <div className={s.grid}>
        {DB_BACKENDS.map(db => (
          <DbBackendCard
            key={db.name}
            db={db}
            selected={selected.name === db.name}
            onSelect={setSelected}
          />
        ))}
      </div>
      <Paper className={s.detail}>
        <Typography variant="subtitle2">
          {selected.name} configuration
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {selected.desc}
        </Typography>
        <code>{selected.env}</code>
      </Paper>
    </div>
  )
}
