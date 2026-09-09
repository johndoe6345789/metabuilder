'use client'

import { useState } from 'react'
import { Typography, Paper, Button, Chip, Alert } from '@/m3'
import { DB_BACKENDS, DEFAULT_BACKEND } from './db-backends'
import { useDbalHealth } from './use-dbal-health'
import { DbBackendCard } from './DbBackendCard'
import { TenantDataCard } from './database/TenantDataCard'
import s from './DatabaseTab.module.scss'

export function DatabaseTab() {
  const [selected, setSelected] = useState(DEFAULT_BACKEND)
  const { status, message, refresh } = useDbalHealth()

  return (
    <div className={s.root}>
      {/* Your own rows first: the backend list below is what DBAL can
          run on, which a founder can neither choose nor change, and for
          a long time it was all this tab had to say. */}
      <Typography variant="h6" gutterBottom>
        Your data
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Everything this community holds, and what it runs on.
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

      <TenantDataCard />

      <Typography variant="subtitle2" className={s.backendsHead}>
        Data backends
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {DB_BACKENDS.length} backend adapters DBAL can run on. Which one
        is in use is set by whoever runs the instance, not here.
      </Typography>
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
