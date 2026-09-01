/**
 * Dynamic Package Page
 *
 * Renders a package view based on the packageId from the URL.
 * Mirrors Qt6 PackageViewLoader which loads QML views dynamically.
 *
 * Packages are loaded from DBAL or the local package catalog.
 */
'use client'

import { useParams } from 'next/navigation'
import { LevelGate } from '@/components/layout/LevelGate'
import { Typography, Paper } from '@/m3'
import { usePackageMetadata } from './use-package-metadata'
import { PackageHeader } from './PackageHeader'
import { PackageDependencies } from './PackageDependencies'
import { PackageViewPlaceholder } from './PackageViewPlaceholder'
import s from './page.module.scss'

function PackageContent({ packageId }: { packageId: string }) {
  const { metadata, loading } = usePackageMetadata(packageId)

  if (loading) {
    return (
      <Typography variant="body2" color="text.secondary">
        Loading package...
      </Typography>
    )
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
      <PackageHeader metadata={metadata} />
      <PackageDependencies dependencies={metadata.dependencies} />
      <PackageViewPlaceholder metadata={metadata} packageId={packageId} />
    </div>
  )
}

export default function PackagePage() {
  const params = useParams()
  const packageId = params.packageId as string | undefined

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
