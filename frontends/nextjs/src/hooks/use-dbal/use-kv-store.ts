import { useCallback } from 'react'
import { toast } from 'sonner'

import { dbal } from '@/lib/dbal-integration'

import { useDBAL } from './use-dbal'

/**
 * Hook for KV store operations
 */
export function useKVStore(tenantId: string = 'default', userId: string = 'system') {
  const { isReady } = useDBAL()

  const set = useCallback(
    async (key: string, value: unknown, ttl?: number) => {
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
    async <T = unknown>(key: string): Promise<T | null> => {
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
    async <T = unknown>(key: string, items: T[]) => {
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
    async <T = unknown>(key: string, start?: number, end?: number): Promise<T[]> => {
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
