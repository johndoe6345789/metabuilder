import { getAdapter } from '../../../core/dbal-client'

/**
 * Get package data for a specific package
 */
export async function getPackageData(packageId: string): Promise<Record<string, any[]>> {
  const adapter = getAdapter()
  const pkg = (await adapter.findFirst('PackageData', {
    where: { packageId },
  })) as { data: string } | null
  if (!pkg) return {}
  return JSON.parse(pkg.data)
}
