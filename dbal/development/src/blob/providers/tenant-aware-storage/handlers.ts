import type { BlobListOptions, BlobListResult, BlobMetadata, DownloadOptions, UploadOptions } from '../../blob-storage'
import { createTenantContextLoader, TenantStorageDependencies } from './context'
import { createDeletionHandler } from './deletions'
import { createDownloadHandlers } from './downloads'
import { createListingHandler } from './listing'
import { createPresignedUrlHandler } from './presigned'
import { createStatsHandler } from './stats'
import { createUploadHandlers } from './uploads'

export const createTenantAwareHandlers = (dependencies: TenantStorageDependencies) => {
  const getContext = createTenantContextLoader(dependencies)

  const uploads = createUploadHandlers(dependencies, getContext)
  const downloads = createDownloadHandlers(dependencies, getContext)
  const deletions = createDeletionHandler(dependencies, getContext)
  const listing = createListingHandler(dependencies, getContext)
  const stats = createStatsHandler(dependencies, getContext)
  const presigned = createPresignedUrlHandler(dependencies, getContext)

  return {
    upload: uploads.upload,
    uploadStream: uploads.uploadStream,
    download: downloads.download,
    downloadStream: downloads.downloadStream,
    deleteBlob: deletions.deleteBlob,
    exists: downloads.exists,
    copy: uploads.copy,
    list: listing.list,
    getMetadata: downloads.getMetadata,
    getStats: stats.getStats,
    generatePresignedUrl: presigned.generatePresignedUrl,
    getTotalSize: stats.getTotalSize,
    getObjectCount: stats.getObjectCount,
  }
}

export type TenantAwareHandlers = {
  upload: (key: string, data: Buffer, options?: UploadOptions) => Promise<BlobMetadata>
  uploadStream: (
    key: string,
    stream: ReadableStream | NodeJS.ReadableStream,
    size: number,
    options?: UploadOptions
  ) => Promise<BlobMetadata>
  download: (key: string) => Promise<Buffer>
  downloadStream: (
    key: string,
    options?: DownloadOptions
  ) => Promise<ReadableStream | NodeJS.ReadableStream>
  deleteBlob: (key: string) => Promise<boolean>
  exists: (key: string) => Promise<boolean>
  copy: (sourceKey: string, destKey: string) => Promise<BlobMetadata>
  list: (options?: BlobListOptions) => Promise<BlobListResult>
  getMetadata: (key: string) => Promise<BlobMetadata>
  getStats: () => Promise<{ count: number; totalSize: number }>
  generatePresignedUrl: (key: string, expiresIn: number) => Promise<string>
  getTotalSize: () => Promise<number>
  getObjectCount: () => Promise<number>
}
