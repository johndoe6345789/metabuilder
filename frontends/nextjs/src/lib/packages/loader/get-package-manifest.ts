import { PACKAGE_CATALOG } from '../../package-lib/package-catalog'

/**
 * Get the manifest of a package by its ID
 */
export function getPackageManifest(packageId: string) {
  const packageEntry = PACKAGE_CATALOG[packageId]
  const packageData = packageEntry?.()

  return packageData ? packageData.manifest : null
}
