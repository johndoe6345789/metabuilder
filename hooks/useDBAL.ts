/**
 * useDBAL hook - Basic DBAL API client using fetch
 */

import { useState, useCallback } from 'react'

interface DBALError {
  message: string
  code?: string
}

interface DBALResponse<T> {
  data?: T
  error?: DBALError
}

export function useDBAL() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<DBALError | null>(null)

  const request = useCallback(async <T,>(
    method: string,
    endpoint: string,
    body?: unknown
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/dbal/${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      const result: DBALResponse<T> = await response.json()

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
  }, [])

  return {
    loading,
    error,
    get: async (entity: string, id: string) => {
      return request('GET', `${entity}/${id}`)
    },
    list: async (entity: string, params?: Record<string, unknown>) => {
      const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ''
      return request('GET', `${entity}${queryString}`)
    },
    create: async (entity: string, data: unknown) => {
      return request('POST', entity, data)
    },
    update: async (entity: string, id: string, data: unknown) => {
      return request('PUT', `${entity}/${id}`, data)
    },
    delete: async (entity: string, id: string) => {
      return request('DELETE', `${entity}/${id}`)
    },
  }
}
