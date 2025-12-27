import type { BlobListOptions, BlobListResult, BlobMetadata } from '../../blob-storage'
import { toBlobMetadata } from './blob-data'
import type { MemoryStoreContext } from './store-context'

export const createListingHandler = (context: MemoryStoreContext) => {
  const list = async (options: BlobListOptions = {}): Promise<BlobListResult> => {
    const prefix = options.prefix || ''
    const maxKeys = options.maxKeys || 1000

    const items: BlobMetadata[] = []
    let nextToken: string | undefined

    for (const [key, blob] of context.store.entries()) {
      if (!prefix || key.startsWith(prefix)) {
        if (items.length >= maxKeys) {
          nextToken = key
          break
        }
        items.push(toBlobMetadata(key, blob))
      }
    }

    return {
      items,
      nextToken,
      isTruncated: nextToken !== undefined,
    }
  }

  return { list }
}
