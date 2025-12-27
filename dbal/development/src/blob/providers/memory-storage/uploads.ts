import type { BlobMetadata, UploadOptions } from '../../blob-storage'
import { DBALError } from '../../../core/foundation/errors'
import { createBlobData, BlobData, toBlobMetadata } from './blob-data'
import { streamToBuffer, SupportedReadable } from './stream-utils'
import type { MemoryStoreContext } from './store-context'

export const createUploadHandlers = (context: MemoryStoreContext) => {
  const upload = async (
    key: string,
    data: Buffer | Uint8Array,
    options: UploadOptions = {}
  ): Promise<BlobMetadata> => {
    const buffer = Buffer.from(data)

    if (!options.overwrite && context.store.has(key)) {
      throw DBALError.conflict(`Blob already exists: ${key}`)
    }

    const blob = createBlobData(buffer, options)
    context.store.set(key, blob)

    return toBlobMetadata(key, blob)
  }

  const uploadStream = async (
    key: string,
    stream: SupportedReadable,
    size: number,
    options: UploadOptions = {}
  ): Promise<BlobMetadata> => {
    const buffer = await streamToBuffer(stream)
    return upload(key, buffer, options)
  }

  const copy = async (sourceKey: string, destKey: string): Promise<BlobMetadata> => {
    const sourceBlob = context.store.get(sourceKey)

    if (!sourceBlob) {
      throw DBALError.notFound(`Source blob not found: ${sourceKey}`)
    }

    const destBlob: BlobData = {
      ...sourceBlob,
      data: Buffer.from(sourceBlob.data),
      lastModified: new Date(),
    }

    context.store.set(destKey, destBlob)

    return toBlobMetadata(destKey, destBlob)
  }

  return {
    upload,
    uploadStream,
    copy,
  }
}
