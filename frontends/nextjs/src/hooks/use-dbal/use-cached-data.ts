import { useCallback, useEffect, useState } from 'react'

import { dbal } from '@/lib/dbal-integration'

import { useKVStore } from './use-kv-store'

/**
 * Hook for storing and retrieving cached data with automatic serialization
 */
export function useCachedData<T>(key: string, tenantId?: string, userId?: string) {
  const { isReady, get, set, delete: deleteKey } = useKVStore(tenantId, userId)
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      if (!isReady) return

      try {
        setLoading(true)
        const cached = await get<T>(key)
        setData(cached)
        setError(null)
      } catch (err) {
        const errorInfo = dbal.handleError(err)
        setError(errorInfo.message)
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [get, isReady, key])

  const save = useCallback(
    async (newData: T, ttl?: number) => {
      try {
        await set(key, newData, ttl)
        setData(newData)
        setError(null)
      } catch (err) {
        const errorInfo = dbal.handleError(err)
        setError(errorInfo.message)
        throw err
      }
    },
    [key, set]
  )

  const clear = useCallback(async () => {
    try {
      await deleteKey(key)
      setData(null)
      setError(null)
    } catch (err) {
      const errorInfo = dbal.handleError(err)
      setError(errorInfo.message)
      throw err
    }
  }, [deleteKey, key])

  return {
    data,
    loading,
    error,
    save,
    clear,
    isReady,
  }
}
