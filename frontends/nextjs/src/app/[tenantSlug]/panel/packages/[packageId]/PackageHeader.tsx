'use client'

import { Typography, Paper, Chip, Avatar } from '@/m3'
import type { PackageMetadata } from './use-package-metadata'
import s from './page.module.scss'

export function PackageHeader({ metadata }: { metadata: PackageMetadata }) {
  return (
    <Paper className={s.panel}>
      <div className={s.header}>
        <Avatar className={s.avatar}>{metadata.icon}</Avatar>
        <div>
          <Typography variant="h5">{metadata.name}</Typography>
          <div className={s.chipRow}>
            <Chip label={`v${metadata.version}`} size="small" />
            <Chip label={metadata.category} size="small" variant="outlined" />
            <Chip
              label={`Level ${metadata.level}`}
              size="small"
              variant="outlined"
            />
          </div>
        </div>
      </div>
      <Typography variant="body1" color="text.secondary">
        {metadata.description}
      </Typography>
    </Paper>
  )
}
