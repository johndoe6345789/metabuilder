import { useCallback, useEffect, useState } from 'react'

import { dbal } from '@/lib/dbal-integration'

import { useKVStore } from './use-kv-store'

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
