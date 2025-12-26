import { getAdapter } from '../dbal-client'

/**
 * Set package data (upsert)
 */
export async function setPackageData(packageId: string, data: Record<string, any[]>): Promise<void> {
  const adapter = getAdapter()
  await adapter.upsert('PackageData', {
    where: { packageId },
    update: { data: JSON.stringify(data) },
    create: { packageId, data: JSON.stringify(data) },
  })
}
