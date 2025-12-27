import type {
  BlobListOptions,
  BlobListResult,
  BlobMetadata,
  DownloadOptions,
  UploadOptions,
} from '../../blob-storage'
import { createCleanupHandler } from './cleanup'
import { createDownloadHandlers } from './downloads'
import { createListingHandler } from './listing'
import { createMetricsHandler } from './metrics'
import { createPresignedUrlHandler } from './presigned'
import { createMemoryStoreContext } from './store-context'
import { createUploadHandlers } from './uploads'

export const createMemoryStorageHandlers = () => {
  const context = createMemoryStoreContext()

  const uploads = createUploadHandlers(context)
  const downloads = createDownloadHandlers(context)
  const listing = createListingHandler(context)
  const cleanup = createCleanupHandler(context)
  const metrics = createMetricsHandler(context)
  const presigned = createPresignedUrlHandler()

  return {
    upload: uploads.upload,
    uploadStream: uploads.uploadStream,
    download: downloads.download,
    downloadStream: downloads.downloadStream,
    deleteBlob: cleanup.deleteBlob,
    exists: downloads.exists,
    getMetadata: downloads.getMetadata,
    list: listing.list,
    generatePresignedUrl: presigned.generatePresignedUrl,
    copy: uploads.copy,
    getTotalSize: metrics.getTotalSize,
    getObjectCount: metrics.getObjectCount,
  }
}

export type MemoryStorageHandlers = {
  upload: (
    key: string,
    data: Buffer | Uint8Array,
    options?: UploadOptions
  ) => Promise<BlobMetadata>
  uploadStream: (
    key: string,
    stream: ReadableStream | NodeJS.ReadableStream,
    size: number,
    options?: UploadOptions
  ) => Promise<BlobMetadata>
  download: (key: string, options?: DownloadOptions) => Promise<Buffer>
  downloadStream: (
    key: string,
    options?: DownloadOptions
  ) => Promise<ReadableStream | NodeJS.ReadableStream>
  deleteBlob: (key: string) => Promise<boolean>
  exists: (key: string) => Promise<boolean>
  getMetadata: (key: string) => Promise<BlobMetadata>
  list: (options?: BlobListOptions) => Promise<BlobListResult>
  generatePresignedUrl: (key: string, expirationSeconds?: number) => Promise<string>
  copy: (sourceKey: string, destKey: string) => Promise<BlobMetadata>
  getTotalSize: () => Promise<number>
  getObjectCount: () => Promise<number>
}
