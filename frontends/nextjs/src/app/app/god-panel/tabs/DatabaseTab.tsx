'use client'

import { Typography, Paper } from '@/m3'
import s from './DatabaseTab.module.scss'

const DB_BACKENDS = [
  { name: 'Memory', desc: 'In-memory (testing)' },
  { name: 'SQLite', desc: 'Embedded, generic CRUD' },
  { name: 'PostgreSQL', desc: 'Direct connection' },
  { name: 'MySQL', desc: 'Direct connection' },
  { name: 'MongoDB', desc: 'JSON/BSON' },
  { name: 'Redis', desc: 'Cache layer' },
  { name: 'Elasticsearch', desc: 'Full-text search' },
  { name: 'SurrealDB', desc: 'Multi-model' },
]

export function DatabaseTab() {
  return (
    <div>
      <Typography variant="h6" gutterBottom>Database Management</Typography>
      <Typography variant="body2" color="text.secondary">
        14 database backends. Configure via DATABASE_URL env var.
      </Typography>
      <div className={s.grid}>
        {DB_BACKENDS.map(db => (
          <Paper key={db.name}>
            <Typography variant="subtitle2">{db.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {db.desc}
            </Typography>
          </Paper>
        ))}
      </div>
    </div>
  )
}
