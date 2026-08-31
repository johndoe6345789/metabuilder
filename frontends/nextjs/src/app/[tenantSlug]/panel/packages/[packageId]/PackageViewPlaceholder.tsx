'use client'

import { Typography, Paper, Chip, Divider } from '@/m3'
import type { PackageMetadata } from './use-package-metadata'
import s from './page.module.scss'

export interface PackageViewPlaceholderProps {
  metadata: PackageMetadata
  packageId: string
}

export function PackageViewPlaceholder({
  metadata,
  packageId,
}: PackageViewPlaceholderProps) {
  return (
    <Paper className={s.emptyPanel}>
      <Typography
        variant="body1"
        color="text.secondary"
        className={s.placeholderTitle}
      >
        Package view for &ldquo;{metadata.name}&rdquo;
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Package-specific UI components are loaded dynamically. In Qt6, this
        maps to PackageViewLoader with packageId: &ldquo;{packageId}&rdquo;.
      </Typography>
      <Divider className={s.divider} />
      <div className={s.centerChips}>
        <Chip label="Adaptive layout" size="small" />
        <Chip label="Realtime telemetry" size="small" />
        <Chip
          label={
            metadata.dependencies.length > 0
              ? 'Dependency package'
              : 'Standalone'
          }
          size="small"
        />
      </div>
    </Paper>
  )
}
