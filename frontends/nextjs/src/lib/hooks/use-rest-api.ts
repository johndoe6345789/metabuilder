'use client'

/**
 * useRestApi Hook
 * 
 * React hook for making RESTful API calls using the tenant routing pattern.
 * Works with the /api/v1/{tenant}/{package}/{entity}/... endpoints.
 */

import { useState, useCallback } from 'react'
import { useTenant, useTenantOptional } from '@/app/[tenant]/[package]/tenant-context'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

interface UseRestApiOptions {
  tenant?: string
  packageId?: string
}

interface RequestOptions {
  take?: number
  skip?: number
  where?: Record<string, unknown>
  orderBy?: Record<string, 'asc' | 'desc'>
}

/**
 * Build query string from options
 */
function buildQueryString(options: RequestOptions): string {
  const params = new URLSearchParams()

  if (options.take) params.set('take', options.take.toString())
  if (options.skip) params.set('skip', options.skip.toString())

  if (options.where) {
    for (const [key, value] of Object.entries(options.where)) {
      params.set(`where.${key}`, String(value))
    }
  }

  if (options.orderBy) {
    for (const [key, value] of Object.entries(options.orderBy)) {
      params.set(`orderBy.${key}`, value)
    }
  }

  const query = params.toString()
  return query ? `?${query}` : ''
}

/**
 * Hook for making REST API calls
 */
export function useRestApi<T = unknown>(options?: UseRestApiOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Try to get tenant from context, fall back to options
  const tenantContext = useTenantOptional()
  const tenant = options?.tenant || tenantContext?.tenant
  const packageId = options?.packageId || tenantContext?.packageId

  /**
   * Build the base URL for API calls
   */
  const buildUrl = useCallback(
    (entity: string, id?: string, action?: string) => {
      if (!tenant || !packageId) {
        throw new Error('Tenant and package are required')
      }
      let url = `/api/v1/${tenant}/${packageId}/${entity}`
      if (id) url += `/${id}`
      if (action) url += `/${action}`
      return url
    },
    [tenant, packageId]
  )

  /**
   * List entities
   */
  const list = useCallback(
    async (entity: string, options?: RequestOptions): Promise<T[]> => {
      setLoading(true)
      setError(null)

      try {
        const url = buildUrl(entity) + buildQueryString(options || {})
        const response = await fetch(url)
        const json: ApiResponse<T[]> = await response.json()

        if (!json.success) {
          throw new Error(json.error || 'Request failed')
        }

        return json.data || []
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [buildUrl]
  )

  /**
   * Read single entity
   */
  const read = useCallback(
    async (entity: string, id: string): Promise<T | null> => {
      setLoading(true)
      setError(null)

      try {
        const url = buildUrl(entity, id)
        const response = await fetch(url)
        const json: ApiResponse<T> = await response.json()

        if (!json.success) {
          throw new Error(json.error || 'Request failed')
        }

        return json.data || null
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [buildUrl]
  )

  /**
   * Create entity
   */
  const create = useCallback(
    async (entity: string, data: Record<string, unknown>): Promise<T> => {
      setLoading(true)
      setError(null)

      try {
        const url = buildUrl(entity)
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const json: ApiResponse<T> = await response.json()

        if (!json.success) {
          throw new Error(json.error || 'Request failed')
        }

        return json.data!
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [buildUrl]
  )

  /**
   * Update entity
   */
  const update = useCallback(
    async (entity: string, id: string, data: Record<string, unknown>): Promise<T> => {
      setLoading(true)
      setError(null)

      try {
        const url = buildUrl(entity, id)
        const response = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const json: ApiResponse<T> = await response.json()

        if (!json.success) {
          throw new Error(json.error || 'Request failed')
        }

        return json.data!
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [buildUrl]
  )

  /**
   * Delete entity
   */
  const remove = useCallback(
    async (entity: string, id: string): Promise<void> => {
      setLoading(true)
      setError(null)

      try {
        const url = buildUrl(entity, id)
        const response = await fetch(url, { method: 'DELETE' })
        const json: ApiResponse<void> = await response.json()

        if (!json.success) {
          throw new Error(json.error || 'Request failed')
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [buildUrl]
  )

  /**
   * Custom action on entity
   */
  const action = useCallback(
    async (
      entity: string,
      id: string,
      actionName: string,
      data?: Record<string, unknown>
    ): Promise<T> => {
      setLoading(true)
      setError(null)

      try {
        const url = buildUrl(entity, id, actionName)
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: data ? JSON.stringify(data) : undefined,
        })
        const json: ApiResponse<T> = await response.json()

        if (!json.success) {
          throw new Error(json.error || 'Request failed')
        }

        return json.data!
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [buildUrl]
  )

  return {
    loading,
    error,
    list,
    read,
    create,
    update,
    remove,
    action,
    buildUrl,
  }
}

/**
 * Hook for a specific entity type
 */
export function useEntity<T = unknown>(entity: string, options?: UseRestApiOptions) {
  const api = useRestApi<T>(options)

  return {
    loading: api.loading,
    error: api.error,
    list: (opts?: RequestOptions) => api.list(entity, opts),
    read: (id: string) => api.read(entity, id),
    create: (data: Record<string, unknown>) => api.create(entity, data),
    update: (id: string, data: Record<string, unknown>) => api.update(entity, id, data),
    remove: (id: string) => api.remove(entity, id),
    action: (id: string, actionName: string, data?: Record<string, unknown>) =>
      api.action(entity, id, actionName, data),
  }
}
