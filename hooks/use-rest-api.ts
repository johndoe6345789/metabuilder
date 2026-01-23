'use client'

/**
 * useRestApi Hook
 * 
 * React hook for making RESTful API calls using the tenant routing pattern.
 * Works with the /api/v1/{tenant}/{package}/{entity}/... endpoints.
 * 
 * Supports accessing data from:
 * - Primary package (default)
 * - Dependency packages (by specifying packageId)
 */

import { useState, useCallback } from 'react'
import { useTenantOptional } from '@/app/[tenant]/[package]/tenant-context'

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
  /** Override the package for this request (useful for dependency packages) */
  packageId?: string
  /** AbortSignal for cancelling the request */
  signal?: AbortSignal
}

/**
 * Build query string from options
 */
function buildQueryString(options: RequestOptions): string {
  const params = new URLSearchParams()

  if (options.take !== undefined) params.set('take', String(options.take))
  if (options.skip !== undefined) params.set('skip', String(options.skip))

  if (options.where !== undefined) {
    for (const [key, value] of Object.entries(options.where)) {
      params.set(`where.${key}`, String(value))
    }
  }

  if (options.orderBy !== undefined) {
    for (const [key, value] of Object.entries(options.orderBy)) {
      params.set(`orderBy.${key}`, value)
    }
  }

  const query = params.toString()
  return query.length > 0 ? `?${query}` : ''
}

/**
 * Hook for making REST API calls
 */
export function useRestApi<T = unknown>(options?: UseRestApiOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Try to get tenant from context, fall back to options
  const tenantContext = useTenantOptional()
  const tenant = options?.tenant ?? tenantContext?.tenant
  const defaultPackageId = options?.packageId ?? tenantContext?.packageId

  /**
   * Build the base URL for API calls
   * @param entity Entity name
   * @param id Optional record ID
   * @param action Optional action name
   * @param pkgOverride Override the package (for dependency package access)
   */
  const buildUrl = useCallback(
    (entity: string, id?: string, action?: string, pkgOverride?: string) => {
      if (!tenant) {
        throw new Error('Tenant is required')
      }
      const pkg = pkgOverride ?? defaultPackageId
      if (!pkg) {
        throw new Error('Package is required')
      }
      let url = `/api/v1/${tenant}/${pkg}/${entity}`
      if (id) url += `/${id}`
      if (action) url += `/${action}`
      return url
    },
    [tenant, defaultPackageId]
  )

  /**
   * List entities
   */
  const list = useCallback(
    async (entity: string, options?: RequestOptions): Promise<T[]> => {
      setLoading(true)
      setError(null)

      try {
        const { packageId: pkgOverride, signal, ...queryOpts } = options ?? {}
        const url = buildUrl(entity, undefined, undefined, pkgOverride) + buildQueryString(queryOpts as RequestOptions)
        const response = await fetch(url, { signal })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const json: ApiResponse<T[]> = await response.json()

        if (!json.success) {
          throw new Error(json.error ?? 'Request failed')
        }

        return json.data ?? []
      } catch (err) {
        // Don't set error state for aborted requests
        if (err instanceof Error && err.name === 'AbortError') {
          throw err
        }
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
    async (entity: string, id: string, options?: { signal?: AbortSignal }): Promise<T | null> => {
      setLoading(true)
      setError(null)

      try {
        const url = buildUrl(entity, id)
        const response = await fetch(url, { signal: options?.signal })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const json: ApiResponse<T> = await response.json()

        if (!json.success) {
          throw new Error(json.error ?? 'Request failed')
        }

        return json.data ?? null
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw err
        }
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
    async (entity: string, data: Record<string, unknown>, options?: { signal?: AbortSignal }): Promise<T> => {
      setLoading(true)
      setError(null)

      try {
        const url = buildUrl(entity)
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          signal: options?.signal,
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const json: ApiResponse<T> = await response.json()

        if (!json.success) {
          throw new Error(json.error ?? 'Request failed')
        }

        return json.data as T
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw err
        }
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
    async (entity: string, id: string, data: Record<string, unknown>, options?: { signal?: AbortSignal }): Promise<T> => {
      setLoading(true)
      setError(null)

      try {
        const url = buildUrl(entity, id)
        const response = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          signal: options?.signal,
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const json: ApiResponse<T> = await response.json()

        if (!json.success) {
          throw new Error(json.error ?? 'Request failed')
        }

        return json.data as T
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw err
        }
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
    async (entity: string, id: string, options?: { signal?: AbortSignal }): Promise<void> => {
      setLoading(true)
      setError(null)

      try {
        const url = buildUrl(entity, id)
        const response = await fetch(url, { method: 'DELETE', signal: options?.signal })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const json: ApiResponse<void> = await response.json()

        if (!json.success) {
          throw new Error(json.error ?? 'Request failed')
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw err
        }
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
      data?: Record<string, unknown>,
      options?: { signal?: AbortSignal }
    ): Promise<T> => {
      setLoading(true)
      setError(null)

      try {
        const url = buildUrl(entity, id, actionName)
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: data !== undefined ? JSON.stringify(data) : undefined,
          signal: options?.signal,
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const json: ApiResponse<T> = await response.json()

        if (!json.success) {
          throw new Error(json.error ?? 'Request failed')
        }

        return json.data as T
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw err
        }
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

/**
 * Hook for accessing entities from a dependency package
 * 
 * @example
 * // On a forum_forge page, access user_manager entities
 * const { list: listRoles } = useDependencyEntity<Role>('user_manager', 'roles')
 * const roles = await listRoles()
 */
export function useDependencyEntity<T = unknown>(
  packageId: string,
  entity: string
) {
  const tenantContext = useTenantOptional()
  
  // Verify package is accessible (either primary or a dependency)
  if (tenantContext && !tenantContext.hasPackage(packageId)) {
    console.warn(
      `Package '${packageId}' is not accessible from '${tenantContext.primaryPackage}'. ` +
      `Add it to dependencies in metadata.json.`
    )
  }

  const api = useRestApi<T>({ packageId })

  return {
    loading: api.loading,
    error: api.error,
    list: (opts?: Omit<RequestOptions, 'packageId'>) => api.list(entity, opts),
    read: (id: string) => api.read(entity, id),
    create: (data: Record<string, unknown>) => api.create(entity, data),
    update: (id: string, data: Record<string, unknown>) => api.update(entity, id, data),
    remove: (id: string) => api.remove(entity, id),
    action: (id: string, actionName: string, data?: Record<string, unknown>) =>
      api.action(entity, id, actionName, data),
  }
}
