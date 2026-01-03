import { getAdapter } from '../../../core/dbal-client'
import type { InstalledPackage } from '../package-types'

type DBALInstalledPackageRecord = {
  packageId: string
  installedAt: number | string | Date
  version: string
  enabled: boolean
}

/**
 * Get all installed packages from database
 */
export async function getInstalledPackages(): Promise<InstalledPackage[]> {
  const adapter = getAdapter()
  const result = (await adapter.list('InstalledPackage')) as {
    data: DBALInstalledPackageRecord[]
  }
  return result.data.map(p => ({
    packageId: p.packageId,
    installedAt: Number(p.installedAt),
    version: p.version,
    enabled: p.enabled,
  }))
}
