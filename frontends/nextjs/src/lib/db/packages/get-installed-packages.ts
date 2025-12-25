import { getAdapter } from '../dbal-client'
import type { InstalledPackage } from '../../packages/package-types'

/**
 * Get all installed packages from database
 */
export async function getInstalledPackages(): Promise<InstalledPackage[]> {
  const adapter = getAdapter()
  const result = await adapter.list('InstalledPackage')
  return (result.data as any[]).map((p) => ({
    packageId: p.packageId,
    installedAt: Number(p.installedAt),
    version: p.version,
    enabled: p.enabled,
  }))
}
