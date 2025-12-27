import type { BlobMetadata, DownloadOptions } from '../../blob-storage'
import { DBALError } from '../../../core/foundation/errors'
import { bufferToReadable } from './stream-utils'
import { toBlobMetadata, BlobData } from './blob-data'
import type { MemoryStoreContext } from './store-context'

const sliceBlobData = (blob: BlobData, options: DownloadOptions): Buffer => {
  if (options.offset === undefined && options.length === undefined) {
    return blob.data
  }

  const offset = options.offset || 0
  const length = options.length || blob.data.length - offset

  if (offset >= blob.data.length) {
    throw DBALError.validationError('Offset exceeds blob size')
  }

  return blob.data.subarray(offset, offset + length)
}

export const createDownloadHandlers = (context: MemoryStoreContext) => {
  const download = async (key: string, options: DownloadOptions = {}): Promise<Buffer> => {
    const blob = context.store.get(key)

    if (!blob) {
      throw DBALError.notFound(`Blob not found: ${key}`)
    }

    return sliceBlobData(blob, options)
  }

  const downloadStream = async (
    key: string,
    options: DownloadOptions = {}
  ): Promise<ReadableStream | NodeJS.ReadableStream> => {
    const data = await download(key, options)
    return bufferToReadable(data)
  }

  const exists = async (key: string): Promise<boolean> => context.store.has(key)

  const getMetadata = async (key: string): Promise<BlobMetadata> => {
    const blob = context.store.get(key)

    if (!blob) {
      throw DBALError.notFound(`Blob not found: ${key}`)
    }

    return toBlobMetadata(key, blob)
  }

  return {
    download,
    downloadStream,
    exists,
    getMetadata,
  }
}
