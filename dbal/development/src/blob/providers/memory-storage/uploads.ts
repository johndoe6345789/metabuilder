import { DBALError } from '../../core/foundation/errors'
import type { UploadOptions } from '../blob-storage'
import type { BlobData, MemoryStore } from './store'
import { generateEtag, makeBlobMetadata } from './store'

export const uploadBuffer = (
  store: MemoryStore,
  key: string,
  data: Buffer | Uint8Array,
  options: UploadOptions = {},
) => {
  const buffer = Buffer.from(data)

  if (!options.overwrite && store.has(key)) {
    throw DBALError.conflict(`Blob already exists: ${key}`)
  }

  const blob: BlobData = {
    data: buffer,
    contentType: options.contentType || 'application/octet-stream',
    etag: generateEtag(buffer),
    lastModified: new Date(),
    metadata: options.metadata || {},
  }

  store.set(key, blob)
  return makeBlobMetadata(key, blob)
}

export const collectStream = async (
  stream: ReadableStream | NodeJS.ReadableStream,
): Promise<Buffer> => {
  const chunks: Buffer[] = []

  if ('getReader' in stream) {
    const reader = stream.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(Buffer.from(value))
    }
  } else {
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk))
    }
  }

  return Buffer.concat(chunks)
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
