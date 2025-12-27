import { DBALError } from '../../core/foundation/errors'
import type { BlobListOptions, BlobListResult, BlobMetadata } from '../blob-storage'
import { makeBlobMetadata } from './store'
import type { MemoryStore } from './store'

export const deleteBlob = async (store: MemoryStore, key: string): Promise<boolean> => {
  if (!store.has(key)) {
    throw DBALError.notFound(`Blob not found: ${key}`)
  }

  store.delete(key)
  return true
}

export const getMetadata = (store: MemoryStore, key: string): BlobMetadata => {
  const blob = store.get(key)

  if (!blob) {
    throw DBALError.notFound(`Blob not found: ${key}`)
  }

  return makeBlobMetadata(key, blob)
}

export const listBlobs = (store: MemoryStore, options: BlobListOptions = {}): BlobListResult => {
  const prefix = options.prefix || ''
  const maxKeys = options.maxKeys || 1000

  const items: BlobMetadata[] = []
  let nextToken: string | undefined

  for (const [key, blob] of store.entries()) {
    if (!prefix || key.startsWith(prefix)) {
      if (items.length >= maxKeys) {
        nextToken = key
        break
      }
      items.push(makeBlobMetadata(key, blob))
    }
  }

  return {
    items,
    nextToken,
    isTruncated: nextToken !== undefined,
  }
}

export const copyBlob = (store: MemoryStore, sourceKey: string, destKey: string): BlobMetadata => {
  const sourceBlob = store.get(sourceKey)

  if (!sourceBlob) {
    throw DBALError.notFound(`Source blob not found: ${sourceKey}`)
  }

  const destBlob = {
    ...sourceBlob,
    data: Buffer.from(sourceBlob.data),
    lastModified: new Date(),
  }

  store.set(destKey, destBlob)
  return makeBlobMetadata(destKey, destBlob)
}

export const getTotalSize = (store: MemoryStore): number => {
  let total = 0
  for (const blob of store.values()) {
    total += blob.data.length
  }
  return total
}

export const getObjectCount = (store: MemoryStore): number => store.size
