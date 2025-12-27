import type { TenantStorageDependencies, TenantContextLoader } from './context'

export const createStatsHandler = (
  dependencies: TenantStorageDependencies,
  getContext: TenantContextLoader
) => {
  const getStats = async (): Promise<{ count: number; totalSize: number }> => {
    const context = await getContext()

    return {
      count: context.quota.currentBlobCount,
      totalSize: context.quota.currentBlobStorageBytes,
    }
  }

  const getTotalSize = async (): Promise<number> => dependencies.baseStorage.getTotalSize()
  const getObjectCount = async (): Promise<number> => dependencies.baseStorage.getObjectCount()

  return {
    getStats,
    getTotalSize,
    getObjectCount,
  }
}
