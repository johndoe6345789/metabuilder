import { PACKAGE_CATALOG } from '../../package-lib/package-catalog'

/**
 * Get the content of a package by its ID
 */
export function getPackageContent(packageId: string) {
  const packageEntry = PACKAGE_CATALOG[packageId]
  const packageData = packageEntry?.()

  return packageData ? packageData.content : null
}
