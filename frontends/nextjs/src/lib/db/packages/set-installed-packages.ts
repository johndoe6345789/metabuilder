import { getAdapter } from '../dbal-client'
import type { InstalledPackage } from '../../packages/package-types'

/**
 * Set all installed packages (replaces existing)
 */
export async function setInstalledPackages(packages: InstalledPackage[]): Promise<void> {
  const adapter = getAdapter()
  // Delete all existing
  const existing = await adapter.list('InstalledPackage')
  for (const item of existing.data as any[]) {
    await adapter.delete('InstalledPackage', item.packageId)
  }
  // Create new ones
  for (const pkg of packages) {
    await adapter.create('InstalledPackage', {
      packageId: pkg.packageId,
      installedAt: BigInt(pkg.installedAt),
      version: pkg.version,
      enabled: pkg.enabled,
    })
  }
}
