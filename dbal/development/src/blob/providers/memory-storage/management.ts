import { DBALError } from '../../core/foundation/errors'
import type { BlobListOptions, BlobListResult, BlobMetadata } from '../blob-storage'
import type { MemoryStore } from './store'
import { toBlobMetadata } from './serialization'
import { cleanupStoreEntry, getBlobOrThrow, normalizeKey } from './utils'

export const deleteBlob = async (store: MemoryStore, key: string): Promise<boolean> => {
  const normalizedKey = normalizeKey(key)

  if (!store.has(normalizedKey)) {
    throw DBALError.notFound(`Blob not found: ${normalizedKey}`)
  }

  cleanupStoreEntry(store, normalizedKey)
  return true
}

export const getMetadata = (store: MemoryStore, key: string): BlobMetadata => {
  const normalizedKey = normalizeKey(key)
  const blob = getBlobOrThrow(store, normalizedKey)

  return toBlobMetadata(normalizedKey, blob)
}

export const listBlobs = (store: MemoryStore, options: BlobListOptions = {}): BlobListResult => {
  const prefix = options.prefix ? normalizeKey(options.prefix) : ''
  const maxKeys = options.maxKeys || 1000

  const items: BlobMetadata[] = []
  let nextToken: string | undefined

  for (const [key, blob] of store.entries()) {
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

export const copyBlob = (store: MemoryStore, sourceKey: string, destKey: string): BlobMetadata => {
  const normalizedSourceKey = normalizeKey(sourceKey)
  const normalizedDestKey = normalizeKey(destKey)
  const sourceBlob = getBlobOrThrow(store, normalizedSourceKey)

  const destBlob = {
    ...sourceBlob,
    data: Buffer.from(sourceBlob.data),
    lastModified: new Date(),
  }

  store.set(normalizedDestKey, destBlob)
  return toBlobMetadata(normalizedDestKey, destBlob)
}

export const getTotalSize = (store: MemoryStore): number => {
  let total = 0
  for (const blob of store.values()) {
    total += blob.data.length
  }
  return total
}

export const getObjectCount = (store: MemoryStore): number => store.size
