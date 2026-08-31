'use client'

import { Typography, Paper, Chip } from '@/m3'
import s from './page.module.scss'

export function PackageDependencies({
  dependencies,
}: {
  dependencies: string[]
}) {
  if (dependencies.length === 0) return null

  return (
    <Paper className={s.panel}>
      <Typography variant="h6" gutterBottom>
        Dependencies
      </Typography>
      <div className={s.chipRow}>
        {dependencies.map(dep => (
          <Chip key={dep} label={dep} size="small" variant="outlined" />
        ))}
      </div>
    </Paper>
  )
}
