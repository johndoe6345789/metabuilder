import { getAdapter } from '../../core/dbal-client'
import { type PackageSeedData } from '@/lib/package-types'

/**
 * Set package data (upsert)
 */
export async function setPackageData(
  packageId: string,
  data: PackageSeedData
): Promise<void> {
  const adapter = getAdapter()
  await adapter.upsert(
    'PackageData',
    { packageId },
    { packageId, data: JSON.stringify(data) }
  )
}
