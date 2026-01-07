import { type PackageSeedData } from '../../../../packages/core/package-types'
import { getAdapter } from '../../../core/dbal-client'

/**
 * Get package data for a specific package
 */
export async function getPackageData(packageId: string): Promise<PackageSeedData> {
  const adapter = getAdapter()
  const pkg = (await adapter.findFirst('PackageData', {
    where: { packageId },
  })) as { data: string } | null
  if (pkg === null) return {}
  return JSON.parse(pkg.data) as PackageSeedData
}
