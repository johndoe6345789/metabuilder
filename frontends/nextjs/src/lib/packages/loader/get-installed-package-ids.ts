import { PACKAGE_CATALOG } from '../../package-lib/package-catalog'

/**
 * Get list of all installed package IDs from the catalog
 */
export function getInstalledPackageIds(): string[] {
  return Object.keys(PACKAGE_CATALOG)
}
