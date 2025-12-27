import { DBALError } from '../../../core/foundation/errors'
import type { MemoryStoreContext } from './store-context'

export const createCleanupHandler = (context: MemoryStoreContext) => {
  const deleteBlob = async (key: string): Promise<boolean> => {
    if (!context.store.has(key)) {
      throw DBALError.notFound(`Blob not found: ${key}`)
    }

    context.store.delete(key)
    return true
  }

  return { deleteBlob }
}
