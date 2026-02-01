/**
 * useDBAL - Generic DBAL API client hook
 *
 * Provides a simple, reusable interface for making requests to any DBAL endpoint.
 * Works across all frontends without service-specific dependencies.
 */

import { useState, useCallback } from 'react'

export interface DBALError {
  message: string
  code?: string
}

export interface DBALResponse<T> {
  data?: T
  error?: DBALError
}

export interface UseDBALOptions {
  /**
   * Base URL for DBAL API requests
   * @default '/api/dbal'
   */
  baseUrl?: string
}

export interface UseDBALResult {
  /**
   * Whether a request is currently loading
   */
  loading: boolean

  /**
   * Error from the last request, if any
   */
  error: DBALError | null

  /**
   * Execute a GET request
   */
  get: <T = unknown>(entity: string, id: string) => Promise<T | null>

  /**
   * Execute a GET request to list entities with optional parameters
   */
  list: <T = unknown>(entity: string, params?: Record<string, unknown>) => Promise<T | null>

  /**
   * Execute a POST request to create an entity
   */
  create: <T = unknown>(entity: string, data: unknown) => Promise<T | null>

  /**
   * Execute a PUT request to update an entity
   */
  update: <T = unknown>(entity: string, id: string, data: unknown) => Promise<T | null>

  /**
   * Execute a DELETE request
   */
  delete: <T = unknown>(entity: string, id: string) => Promise<T | null>

  /**
   * Execute a custom request to any endpoint
   */
  request: <T = unknown>(method: string, endpoint: string, body?: unknown) => Promise<T | null>
}

/**
 * useDBAL hook - Manage DBAL API requests
 *
 * @param options Configuration options (baseUrl, etc.)
 * @returns DBAL client with request methods
 *
 * @example
 * ```tsx
 * const dbal = useDBAL()
 * const user = await dbal.get('users', 'user-123')
 * const users = await dbal.list('users', { filter: { active: true } })
 * await dbal.create('users', { name: 'John' })
 * await dbal.update('users', 'user-123', { name: 'Jane' })
 * await dbal.delete('users', 'user-123')
 * ```
 */
export function useDBAL(options: UseDBALOptions = {}): UseDBALResult {
  const { baseUrl = '/api/dbal' } = options

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<DBALError | null>(null)

  const request = useCallback(
    async <T,>(method: string, endpoint: string, body?: unknown): Promise<T | null> => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`${baseUrl}/${endpoint}`, {
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
    },
    [baseUrl]
  )

  return {
    loading,
    error,
    get: async <T,>(entity: string, id: string) => {
      return request<T>('GET', `${entity}/${id}`)
    },
    list: async <T,>(entity: string, params?: Record<string, unknown>) => {
      const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ''
      return request<T>('GET', `${entity}${queryString}`)
    },
    create: async <T,>(entity: string, data: unknown) => {
      return request<T>('POST', entity, data)
    },
    update: async <T,>(entity: string, id: string, data: unknown) => {
      return request<T>('PUT', `${entity}/${id}`, data)
    },
    delete: async <T,>(entity: string, id: string) => {
      return request<T>('DELETE', `${entity}/${id}`)
    },
    request: request,
  }
}
