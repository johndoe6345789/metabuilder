import { PACKAGE_CATALOG } from '../../package-lib/package-catalog'

/**
 * Get the manifest of a package by its ID
 */
export function getPackageManifest(packageId: string) {
  const pkg = PACKAGE_CATALOG[packageId]
  return pkg ? pkg.manifest : null
}
