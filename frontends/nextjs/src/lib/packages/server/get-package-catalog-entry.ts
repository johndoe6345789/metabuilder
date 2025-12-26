import 'server-only'

import { PACKAGE_CATALOG } from '@/lib/package-catalog'
import type { PackageContent, PackageManifest } from '@/lib/package-types'

export type PackageCatalogEntry = {
  manifest: PackageManifest
  content: PackageContent
}

export function getPackageCatalogEntry(packageId: string): PackageCatalogEntry | null {
  const entry = PACKAGE_CATALOG[packageId]
  if (!entry) return null
  return entry
}
