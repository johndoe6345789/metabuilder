import { PACKAGE_CATALOG } from '../../package-lib/package-catalog'

/**
 * Get the content of a package by its ID
 */
export function getPackageContent(packageId: string) {
  const pkg = PACKAGE_CATALOG[packageId]
  return pkg ? pkg.content : null
}
