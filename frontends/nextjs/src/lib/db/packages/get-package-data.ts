import { getAdapter } from '../dbal-client'

/**
 * Get package data for a specific package
 */
export async function getPackageData(packageId: string): Promise<Record<string, any[]>> {
  const adapter = getAdapter()
  const pkg = await adapter.findFirst('PackageData', {
    where: { packageId },
  })
  if (!pkg) return {}
  return typeof pkg.data === 'string' ? JSON.parse(pkg.data) : pkg.data
}
