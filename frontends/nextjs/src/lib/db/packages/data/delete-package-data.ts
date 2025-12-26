import { getAdapter } from '../dbal-client'

/**
 * Delete package data
 */
export async function deletePackageData(packageId: string): Promise<void> {
  const adapter = getAdapter()
  await adapter.delete('PackageData', packageId)
}
