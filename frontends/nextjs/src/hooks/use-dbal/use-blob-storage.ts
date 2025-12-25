import { useCallback } from 'react'
import { dbal } from '@/lib/dbal-integration'
import { toast } from 'sonner'
import { useDBAL } from './use-dbal'

/**
 * Hook for blob storage operations
 */
export function useBlobStorage() {
  const { isReady } = useDBAL()

  const upload = useCallback(
    async (key: string, data: Buffer | Uint8Array, metadata?: Record<string, string>) => {
      if (!isReady) {
        throw new Error('DBAL not ready')
      }
      try {
        await dbal.blobUpload(key, data, metadata)
        toast.success(`Uploaded: ${key}`)
      } catch (err) {
        const errorInfo = dbal.handleError(err)
        toast.error(`Upload Error: ${errorInfo.message}`)
        throw err
      }
    },
    [isReady]
  )

  const download = useCallback(
    async (key: string): Promise<Buffer> => {
      if (!isReady) {
        throw new Error('DBAL not ready')
      }
      try {
        return await dbal.blobDownload(key)
      } catch (err) {
        const errorInfo = dbal.handleError(err)
        toast.error(`Download Error: ${errorInfo.message}`)
        throw err
      }
    },
    [isReady]
  )

  const del = useCallback(
    async (key: string) => {
      if (!isReady) {
        throw new Error('DBAL not ready')
      }
      try {
        await dbal.blobDelete(key)
        toast.success(`Deleted: ${key}`)
      } catch (err) {
        const errorInfo = dbal.handleError(err)
        toast.error(`Delete Error: ${errorInfo.message}`)
        throw err
      }
    },
    [isReady]
  )

  const list = useCallback(
    async (prefix?: string): Promise<string[]> => {
      if (!isReady) {
        throw new Error('DBAL not ready')
      }
      try {
        return await dbal.blobList(prefix)
      } catch (err) {
        const errorInfo = dbal.handleError(err)
        toast.error(`List Error: ${errorInfo.message}`)
        throw err
      }
    },
    [isReady]
  )

  const getMetadata = useCallback(
    async (key: string): Promise<Record<string, string>> => {
      if (!isReady) {
        throw new Error('DBAL not ready')
      }
      try {
        return await dbal.blobGetMetadata(key)
      } catch (err) {
        const errorInfo = dbal.handleError(err)
        toast.error(`Get Metadata Error: ${errorInfo.message}`)
        throw err
      }
    },
    [isReady]
  )

  return {
    isReady,
    upload,
    download,
    delete: del,
    list,
    getMetadata,
  }
}
