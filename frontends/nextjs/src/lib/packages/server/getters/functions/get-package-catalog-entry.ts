import 'server-only'

import { PACKAGE_CATALOG, type PackageCatalogData } from '@/lib/package-catalog'

export function getPackageCatalogEntry(packageId: string): PackageCatalogData | null {
  const entry = PACKAGE_CATALOG[packageId]
  if (!entry) return null
  return entry()
}
