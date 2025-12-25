import { getAdapter } from '../dbal-client'
import type { InstalledPackage } from '../../package-types'

/**
 * Install a package (creates record if not exists)
 */
export async function installPackage(packageData: InstalledPackage): Promise<void> {
  const adapter = getAdapter()
  const existing = await adapter.findFirst('InstalledPackage', {
    where: { packageId: packageData.packageId },
  })
  if (!existing) {
    await adapter.create('InstalledPackage', {
      packageId: packageData.packageId,
      installedAt: BigInt(packageData.installedAt),
      version: packageData.version,
      enabled: packageData.enabled,
    })
  }
}
