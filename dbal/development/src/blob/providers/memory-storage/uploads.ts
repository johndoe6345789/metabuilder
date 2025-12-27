import { DBALError } from '../../core/foundation/errors'
import type { UploadOptions } from '../blob-storage'
import type { MemoryStore } from './store'
import { collectStream, toBlobData, toBlobMetadata } from './serialization'
import { normalizeKey } from './utils'

export const uploadBuffer = (
  store: MemoryStore,
  key: string,
  data: Buffer | Uint8Array,
  options: UploadOptions = {},
) => {
  const normalizedKey = normalizeKey(key)
  const buffer = Buffer.from(data)

  if (!options.overwrite && store.has(normalizedKey)) {
    throw DBALError.conflict(`Blob already exists: ${normalizedKey}`)
  }

  const blob = toBlobData(buffer, options)

  store.set(normalizedKey, blob)
  return toBlobMetadata(normalizedKey, blob)
}

export const uploadFromStream = async (
  store: MemoryStore,
  key: string,
  stream: ReadableStream | NodeJS.ReadableStream,
  options?: UploadOptions,
) => {
  const buffer = await collectStream(stream)
  return uploadBuffer(store, key, buffer, options)
}
