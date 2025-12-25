/**
 * React Hooks for DBAL Integration
 * 
 * Provides React hooks for easy access to DBAL functionality
 * throughout the MetaBuilder application.
 */

import { useState, useEffect, useCallback } from 'react'
import { dbal, DBALError, DBALErrorCode } from '@/lib/dbal-integration'
import { toast } from 'sonner'

/**
 * Hook to ensure DBAL is initialized
 */
export function useDBAL() {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        if (!dbal.isInitialized()) {
          await dbal.initialize()
        }
        setIsReady(true)
      } catch (err) {
        const errorInfo = dbal.handleError(err)
        setError(errorInfo.message)
        console.error('DBAL initialization failed:', err)
      }
    }

    init()
  }, [])

  return { isReady, error }
}

/**
 * Hook for KV store operations
 */
export function useKVStore(tenantId: string = 'default', userId: string = 'system') {
  const { isReady } = useDBAL()

  const set = useCallback(
    async (key: string, value: any, ttl?: number) => {
      if (!isReady) {
        throw new Error('DBAL not ready')
      }
      try {
        await dbal.kvSet(key, value, ttl, tenantId, userId)
      } catch (err) {
        const errorInfo = dbal.handleError(err)
        toast.error(`KV Set Error: ${errorInfo.message}`)
        throw err
      }
    },
    [isReady, tenantId, userId]
  )

  const get = useCallback(
    async <T = any>(key: string): Promise<T | null> => {
      if (!isReady) {
        throw new Error('DBAL not ready')
      }
      try {
        return await dbal.kvGet<T>(key, tenantId, userId)
      } catch (err) {
        const errorInfo = dbal.handleError(err)
        toast.error(`KV Get Error: ${errorInfo.message}`)
        throw err
      }
    },
    [isReady, tenantId, userId]
  )

  const del = useCallback(
    async (key: string): Promise<boolean> => {
      if (!isReady) {
        throw new Error('DBAL not ready')
      }
      try {
        return await dbal.kvDelete(key, tenantId, userId)
      } catch (err) {
        const errorInfo = dbal.handleError(err)
        toast.error(`KV Delete Error: ${errorInfo.message}`)
        throw err
      }
    },
    [isReady, tenantId, userId]
  )

  const listAdd = useCallback(
    async (key: string, items: any[]) => {
      if (!isReady) {
        throw new Error('DBAL not ready')
      }
      try {
        await dbal.kvListAdd(key, items, tenantId, userId)
      } catch (err) {
        const errorInfo = dbal.handleError(err)
        toast.error(`KV List Add Error: ${errorInfo.message}`)
        throw err
      }
    },
    [isReady, tenantId, userId]
  )

  const listGet = useCallback(
    async (key: string, start?: number, end?: number): Promise<any[]> => {
      if (!isReady) {
        throw new Error('DBAL not ready')
      }
      try {
        return await dbal.kvListGet(key, tenantId, userId, start, end)
      } catch (err) {
        const errorInfo = dbal.handleError(err)
        toast.error(`KV List Get Error: ${errorInfo.message}`)
        throw err
      }
    },
    [isReady, tenantId, userId]
  )

  return {
    isReady,
    set,
    get,
    delete: del,
    listAdd,
    listGet,
  }
}

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

/**
 * Hook for storing and retrieving cached data with automatic serialization
 */
export function useCachedData<T>(key: string, tenantId?: string, userId?: string) {
  const kv = useKVStore(tenantId, userId)
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      if (!kv.isReady) return

      try {
        setLoading(true)
        const cached = await kv.get<T>(key)
        setData(cached)
        setError(null)
      } catch (err) {
        const errorInfo = dbal.handleError(err)
        setError(errorInfo.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [key, kv.isReady])

  const save = useCallback(
    async (newData: T, ttl?: number) => {
      try {
        await kv.set(key, newData, ttl)
        setData(newData)
        setError(null)
      } catch (err) {
        const errorInfo = dbal.handleError(err)
        setError(errorInfo.message)
        throw err
      }
    },
    [key, kv]
  )

  const clear = useCallback(async () => {
    try {
      await kv.delete(key)
      setData(null)
      setError(null)
    } catch (err) {
      const errorInfo = dbal.handleError(err)
      setError(errorInfo.message)
      throw err
    }
  }, [key, kv])

  return {
    data,
    loading,
    error,
    save,
    clear,
    isReady: kv.isReady,
  }
}
