import type { MemoryStoreContext } from './store-context'

export const createMetricsHandler = (context: MemoryStoreContext) => {
  const getTotalSize = async (): Promise<number> => {
    let total = 0
    for (const blob of context.store.values()) {
      total += blob.data.length
    }
    return total
  }

  const getObjectCount = async (): Promise<number> => context.store.size

  return {
    getTotalSize,
    getObjectCount,
  }
}
