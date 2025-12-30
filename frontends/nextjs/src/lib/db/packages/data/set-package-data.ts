import { getAdapter } from '../../core/dbal-client'
import { type PackageSeedData } from '../../packages/core/package-types'

/**
 * Set package data (upsert)
 */
export async function setPackageData(
  packageId: string,
  data: PackageSeedData
): Promise<void> {
  const adapter = getAdapter()
  await adapter.upsert('PackageData', {
    where: { packageId },
    update: { data: JSON.stringify(data) },
    create: { packageId, data: JSON.stringify(data) },
  })
}
