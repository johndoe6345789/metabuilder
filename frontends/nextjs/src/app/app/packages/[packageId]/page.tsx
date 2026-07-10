/**
 * Dynamic Package Page
 *
 * Renders a package view based on the packageId from the URL.
 * Mirrors Qt6 PackageViewLoader which loads QML views dynamically.
 *
 * Packages are loaded from DBAL or the local package catalog.
 */
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { LevelGate } from '@/components/layout/LevelGate'
import {
  Typography,
  Paper,
  Chip,
  Avatar,
  Divider,
} from '@/m3'
import s from './page.module.scss'

const DBAL_URL = typeof process !== 'undefined'
  ? (process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080')
  : 'http://localhost:8080'

interface PackageMetadata {
  packageId: string
  name: string
  version: string
  description: string
  dependencies: string[]
  level: number
  category: string
  icon: string
}

function PackageContent({ packageId }: { packageId: string }) {
  const [metadata, setMetadata] = useState<PackageMetadata | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${DBAL_URL}/system/core/package/${packageId}`, { signal: AbortSignal.timeout(5000) })
      .then(res => res.ok ? res.json() : null)
      .then((json: { data?: PackageMetadata } | null) => {
        if (json?.data != null) setMetadata(json.data)
        setLoading(false)
      })
      .catch(() => {
        setMetadata({
          packageId,
          name: packageId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          version: '1.0.0',
          description: `Package: ${packageId}`,
          dependencies: [],
          level: 2,
          category: 'general',
          icon: packageId.charAt(0).toUpperCase(),
        })
        setLoading(false)
      })
  }, [packageId])

  if (loading) {
    return <Typography variant="body2" color="text.secondary">Loading package...</Typography>
  }

  if (metadata == null) {
    return (
      <Paper className={s.emptyPanel}>
        <Typography variant="h6">Package Not Found</Typography>
        <Typography variant="body2" color="text.secondary">
          Package &ldquo;{packageId}&rdquo; could not be loaded.
        </Typography>
      </Paper>
    )
  }

  return (
    <div className={s.root}>
      {/* Package header */}
      <Paper className={s.panel}>
        <div className={s.header}>
          <Avatar className={s.avatar}>
            {metadata.icon}
          </Avatar>
          <div>
            <Typography variant="h5">{metadata.name}</Typography>
            <div className={s.chipRow}>
              <Chip label={`v${metadata.version}`} size="small" />
              <Chip label={metadata.category} size="small" variant="outlined" />
              <Chip label={`Level ${metadata.level}`} size="small" variant="outlined" />
            </div>
          </div>
        </div>
        <Typography variant="body1" color="text.secondary">
          {metadata.description}
        </Typography>
      </Paper>

      {/* Dependencies */}
      {metadata.dependencies.length > 0 && (
        <Paper className={s.panel}>
          <Typography variant="h6" gutterBottom>Dependencies</Typography>
          <div className={s.chipRow}>
            {metadata.dependencies.map(dep => (
              <Chip key={dep} label={dep} size="small" variant="outlined" />
            ))}
          </div>
        </Paper>
      )}

      {/* Package view placeholder */}
      <Paper className={s.emptyPanel}>
        <Typography variant="body1" color="text.secondary" className={s.placeholderTitle}>
          Package view for &ldquo;{metadata.name}&rdquo;
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Package-specific UI components are loaded dynamically.
          In Qt6, this maps to PackageViewLoader with packageId: &ldquo;{packageId}&rdquo;.
        </Typography>
        <Divider className={s.divider} />
        <div className={s.centerChips}>
          <Chip label="Adaptive layout" size="small" />
          <Chip label="Realtime telemetry" size="small" />
          <Chip label={metadata.dependencies.length > 0 ? 'Dependency package' : 'Standalone'} size="small" />
        </div>
      </Paper>
    </div>
  )
}

export default function PackagePage() {
  const params = useParams()
  const packageId = params?.packageId as string | undefined

  if (packageId == null || packageId === '') {
    return (
      <Paper className={s.emptyPanel}>
        <Typography variant="h6">No Package Selected</Typography>
      </Paper>
    )
  }

  return (
    <LevelGate minLevel={1} levelName="User">
      <PackageContent packageId={packageId} />
    </LevelGate>
  )
}
