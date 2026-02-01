/**
 * useKV hook - Basic key-value store using DBAL KV API
 */

import { useState, useCallback } from 'react'

interface KVError {
  message: string
  code?: string
}

interface KVResponse<T> {
  data?: T
  error?: KVError
}

export function useKV(namespace: string = 'default') {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<KVError | null>(null)

  const request = useCallback(async <T,>(
    method: string,
    endpoint: string,
    body?: unknown
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/kv/${namespace}/${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      const result: KVResponse<T> = await response.json()

      if (!response.ok || result.error) {
        const err = result.error || { message: 'Request failed' }
        setError(err)
        throw new Error(err.message)
      }

      return result.data ?? null
    } catch (err) {
      const error = err instanceof Error ? { message: err.message } : { message: 'Unknown error' }
      setError(error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [namespace])

  return {
    loading,
    error,
    get: async (key: string) => {
      return request('GET', key)
    },
    set: async (key: string, value: unknown) => {
      return request('PUT', key, { value })
    },
    delete: async (key: string) => {
      return request('DELETE', key)
    },
    list: async (prefix?: string) => {
      const queryString = prefix ? `?prefix=${encodeURIComponent(prefix)}` : ''
      return request<string[]>('GET', `_list${queryString}`)
    },
  }
}
