'use client'

import { useEffect, useState } from 'react'
import { Typography, Paper, Button, Chip, Alert } from '@/m3'
import s from './DatabaseTab.module.scss'

const DBAL_URL =
  process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

interface DbBackend {
  name: string
  desc: string
  env: string
}

const DB_BACKENDS: [DbBackend, ...DbBackend[]] = [
  { name: 'Memory', desc: 'In-memory adapter for tests and demos', env: 'DBAL_BACKEND=memory' },
  { name: 'SQLite', desc: 'Embedded file database for local installs', env: 'DATABASE_URL=sqlite://...' },
  { name: 'PostgreSQL', desc: 'Primary production relational backend', env: 'DATABASE_URL=postgres://...' },
  { name: 'MySQL', desc: 'Direct SQL backend for MySQL-compatible stores', env: 'DATABASE_URL=mysql://...' },
  { name: 'MongoDB', desc: 'Document storage for JSON/BSON data', env: 'DATABASE_URL=mongodb://...' },
  { name: 'Redis', desc: 'Cache and ephemeral state layer', env: 'REDIS_URL=redis://...' },
  { name: 'Elasticsearch', desc: 'Full-text index and search backend', env: 'ELASTICSEARCH_URL=http://...' },
  { name: 'SurrealDB', desc: 'Multi-model backend for graph-like data', env: 'SURREALDB_URL=http://...' },
]

const DEFAULT_BACKEND = DB_BACKENDS[0]

export function DatabaseTab() {
  const [selected, setSelected] = useState(DEFAULT_BACKEND)
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [message, setMessage] = useState<string | null>(null)

  const checkHealth = () => {
    fetch(`${DBAL_URL}/health`, { signal: AbortSignal.timeout(5000) })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setStatus('online')
        setMessage(null)
      })
      .catch((e: unknown) => {
        setStatus('offline')
        setMessage(e instanceof Error ? e.message : 'DBAL health check failed')
      })
  }

  const refresh = () => {
    setStatus('checking')
    checkHealth()
  }

  useEffect(() => { checkHealth() }, [])

  return (
    <div className={s.root}>
      <Typography variant="h6" gutterBottom>Database Management</Typography>
      <Typography variant="body2" color="text.secondary">
        {DB_BACKENDS.length} backend adapters. Select one to inspect the required runtime configuration.
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
      {message !== null && (
        <Alert severity="warning">
          {message}
        </Alert>
      )}
      <div className={s.grid}>
        {DB_BACKENDS.map(db => (
          <button
            key={db.name}
            type="button"
            className={`${s.backend} ${selected.name === db.name ? s.selected : ''}`}
            onClick={() => { setSelected(db) }}
          >
            <Typography variant="subtitle2">{db.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {db.desc}
            </Typography>
          </button>
        ))}
      </div>
      <Paper className={s.detail}>
        <Typography variant="subtitle2">{selected.name} configuration</Typography>
        <Typography variant="body2" color="text.secondary">
          {selected.desc}
        </Typography>
        <code>{selected.env}</code>
      </Paper>
    </div>
  )
}
