import { DBALError } from '@/core/foundation/errors'
import type { BlobData, MemoryStore } from './store'

export const normalizeKey = (key: string): string => key.replace(/^\/+/, '').trim()

export const getBlobOrThrow = (store: MemoryStore, key: string): BlobData => {
  const blob = store.get(key)

  if (!blob) {
    throw DBALError.notFound(`Blob not found: ${key}`)
  }

  return blob
}

export const cleanupStoreEntry = (store: MemoryStore, key: string): void => {
  store.delete(key)
}
