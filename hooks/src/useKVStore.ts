'use client'

/**
 * @file useKVStore.ts
 * @description Hook for key-value store operations via the C++ DBAL REST API.
 *
 * Replaces the TypeScript InMemoryKVStore pattern:
 *   const kv = new InMemoryKVStore()
 *   await kv.set('key', 'value', tenantContext)
 *
 * With a REST-based hook:
 *   const kv = useKVStore({ tenant: 'acme', packageId: 'settings' })
 *   await kv.set('theme', 'dark')
 *
 * REST endpoints:
 *   GET    /api/v1/{tenant}/{package}/kv/{key}           - get value
 *   PUT    /api/v1/{tenant}/{package}/kv/{key}           - set value
 *   DELETE /api/v1/{tenant}/{package}/kv/{key}           - delete value
 *   HEAD   /api/v1/{tenant}/{package}/kv/{key}           - check exists
 *   GET    /api/v1/{tenant}/{package}/kv?prefix=...      - list keys
 *   POST   /api/v1/{tenant}/{package}/kv/_mget           - multi-get
 *   POST   /api/v1/{tenant}/{package}/kv/_mset           - multi-set
 *   POST   /api/v1/{tenant}/{package}/kv/_count          - count keys
 *   POST   /api/v1/{tenant}/{package}/kv/_clear          - clear all
 *   GET    /api/v1/{tenant}/{package}/kv/{key}/list       - list operations
 *   POST   /api/v1/{tenant}/{package}/kv/{key}/list/add   - list add
 *   POST   /api/v1/{tenant}/{package}/kv/{key}/list/remove - list remove
 *   DELETE /api/v1/{tenant}/{package}/kv/{key}/list       - list clear
 */

import { useState, useCallback } from 'react'
import type {
  DBALClientConfig,
  StorableValue,
  KVListOptions,
  KVListResult,
} from './types'
import { DBALError, DBALErrorCode } from './types'

// ---------------------------------------------------------------------------
// Hook return type
// ---------------------------------------------------------------------------

export interface UseKVStoreReturn {
  /** Whether a request is in flight */
  loading: boolean
  /** Last error from a failed request */
  error: Error | null

  // -- Basic key-value operations --

  /** Get a value by key */
  get: (key: string, signal?: AbortSignal) => Promise<StorableValue | null>

  /** Set a value with optional TTL (seconds) */
  set: (key: string, value: StorableValue, ttl?: number, signal?: AbortSignal) => Promise<void>

  /** Delete a key */
  remove: (key: string, signal?: AbortSignal) => Promise<boolean>

  /** Check if a key exists */
  exists: (key: string, signal?: AbortSignal) => Promise<boolean>

  // -- List operations (for list-type values) --

  /** Add items to a list stored at key */
  listAdd: (key: string, items: StorableValue[], signal?: AbortSignal) => Promise<number>

  /** Get items from a list stored at key */
  listGet: (key: string, start?: number, end?: number, signal?: AbortSignal) => Promise<StorableValue[]>

  /** Remove a value from a list stored at key */
  listRemove: (key: string, value: StorableValue, signal?: AbortSignal) => Promise<number>

  /** Get the length of a list stored at key */
  listLength: (key: string, signal?: AbortSignal) => Promise<number>

  /** Clear a list stored at key */
  listClear: (key: string, signal?: AbortSignal) => Promise<void>

  // -- Batch operations --

  /** Get multiple values at once */
  mget: (keys: string[], signal?: AbortSignal) => Promise<Map<string, StorableValue | null>>

  /** Set multiple values at once */
  mset: (entries: Map<string, StorableValue>, signal?: AbortSignal) => Promise<void>

  // -- Query operations --

  /** List keys with optional prefix/cursor pagination */
  list: (options?: KVListOptions, signal?: AbortSignal) => Promise<KVListResult>

  /** Count keys matching a prefix */
  count: (prefix?: string, signal?: AbortSignal) => Promise<number>

  /** Clear all keys (use with caution) */
  clear: (signal?: AbortSignal) => Promise<number>

  /** Clear the current error state */
  clearError: () => void
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildKVUrl(config: DBALClientConfig, key?: string): string {
  const base = config.baseUrl ?? ''
  const tenant = config.tenant
  const pkg = config.packageId

  if (!tenant) {
    throw new DBALError(DBALErrorCode.VALIDATION_ERROR, 'Tenant is required for KV operations')
  }
  if (!pkg) {
    throw new DBALError(DBALErrorCode.VALIDATION_ERROR, 'Package is required for KV operations')
  }

  let url = `${base}/api/v1/${tenant}/${pkg}/kv`
  if (key) url += `/${encodeURIComponent(key)}`
  return url
}

async function jsonFetch<T>(
  url: string,
  init: RequestInit,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...extraHeaders,
  }

  const response = await fetch(url, { ...init, headers })

  if (!response.ok) {
    let message: string
    try {
      const json = await response.json()
      message = json.error ?? json.message ?? `HTTP ${response.status}`
    } catch {
      message = `HTTP ${response.status}: ${response.statusText}`
    }
    throw DBALError.fromResponse(response.status, message)
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    const json = await response.json()
    // Support both { data: T } envelope and raw T responses
    return json.data !== undefined ? json.data : json
  }

  // Empty response (e.g. 204 No Content)
  return undefined as unknown as T
}

// ---------------------------------------------------------------------------
// Hook implementation
// ---------------------------------------------------------------------------

/**
 * Hook for key-value store operations via the C++ DBAL REST API.
 *
 * @param config - DBAL client config (tenant, packageId, baseUrl, etc.)
 *
 * @example
 * const kv = useKVStore({ tenant: 'acme', packageId: 'settings' })
 *
 * // Basic operations
 * await kv.set('user:123:theme', 'dark')
 * const theme = await kv.get('user:123:theme')  // 'dark'
 * await kv.remove('user:123:theme')
 *
 * // List operations
 * await kv.listAdd('user:123:tags', ['admin', 'editor'])
 * const tags = await kv.listGet('user:123:tags')
 *
 * // Batch operations
 * const values = await kv.mget(['key1', 'key2', 'key3'])
 */
export function useKVStore(config: DBALClientConfig = {}): UseKVStoreReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const withState = useCallback(
    async <R,>(fn: () => Promise<R>): Promise<R> => {
      setError(null)
      setLoading(true)

      try {
        return await fn()
      } catch (err) {
        const wrappedError = err instanceof Error ? err : new Error(String(err))
        if (wrappedError.name !== 'AbortError') {
          setError(wrappedError)
        }
        throw wrappedError
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // -- Basic key-value operations -------------------------------------------

  const get = useCallback(
    async (key: string, signal?: AbortSignal): Promise<StorableValue | null> => {
      return withState(async () => {
        const url = buildKVUrl(config, key)
        return jsonFetch<StorableValue | null>(url, { method: 'GET', signal }, config.headers)
      })
    },
    [config, withState]
  )

  const set = useCallback(
    async (key: string, value: StorableValue, ttl?: number, signal?: AbortSignal): Promise<void> => {
      return withState(async () => {
        const url = buildKVUrl(config, key)
        const body: Record<string, unknown> = { value }
        if (ttl !== undefined) body.ttl = ttl
        await jsonFetch<void>(url, {
          method: 'PUT',
          body: JSON.stringify(body),
          signal,
        }, config.headers)
      })
    },
    [config, withState]
  )

  const remove = useCallback(
    async (key: string, signal?: AbortSignal): Promise<boolean> => {
      return withState(async () => {
        const url = buildKVUrl(config, key)
        return jsonFetch<boolean>(url, { method: 'DELETE', signal }, config.headers)
      })
    },
    [config, withState]
  )

  const exists = useCallback(
    async (key: string, signal?: AbortSignal): Promise<boolean> => {
      return withState(async () => {
        const url = buildKVUrl(config, key)
        const response = await fetch(url, {
          method: 'HEAD',
          headers: config.headers,
          signal,
        })
        return response.ok
      })
    },
    [config, withState]
  )

  // -- List operations (for list-type values) --------------------------------

  const listAdd = useCallback(
    async (key: string, items: StorableValue[], signal?: AbortSignal): Promise<number> => {
      return withState(async () => {
        const url = buildKVUrl(config, key) + '/list/add'
        return jsonFetch<number>(url, {
          method: 'POST',
          body: JSON.stringify({ items }),
          signal,
        }, config.headers)
      })
    },
    [config, withState]
  )

  const listGet = useCallback(
    async (
      key: string,
      start?: number,
      end?: number,
      signal?: AbortSignal
    ): Promise<StorableValue[]> => {
      return withState(async () => {
        const url = buildKVUrl(config, key) + '/list'
        const params = new URLSearchParams()
        if (start !== undefined) params.set('start', String(start))
        if (end !== undefined) params.set('end', String(end))
        const qs = params.toString()
        const fullUrl = qs ? `${url}?${qs}` : url
        return jsonFetch<StorableValue[]>(fullUrl, { method: 'GET', signal }, config.headers)
      })
    },
    [config, withState]
  )

  const listRemove = useCallback(
    async (key: string, value: StorableValue, signal?: AbortSignal): Promise<number> => {
      return withState(async () => {
        const url = buildKVUrl(config, key) + '/list/remove'
        return jsonFetch<number>(url, {
          method: 'POST',
          body: JSON.stringify({ value }),
          signal,
        }, config.headers)
      })
    },
    [config, withState]
  )

  const listLength = useCallback(
    async (key: string, signal?: AbortSignal): Promise<number> => {
      return withState(async () => {
        const url = buildKVUrl(config, key) + '/list'
        const response = await fetch(url, {
          method: 'HEAD',
          headers: config.headers,
          signal,
        })
        return parseInt(response.headers.get('x-list-length') ?? '0', 10)
      })
    },
    [config, withState]
  )

  const listClear = useCallback(
    async (key: string, signal?: AbortSignal): Promise<void> => {
      return withState(async () => {
        const url = buildKVUrl(config, key) + '/list'
        await jsonFetch<void>(url, { method: 'DELETE', signal }, config.headers)
      })
    },
    [config, withState]
  )

  // -- Batch operations ------------------------------------------------------

  const mget = useCallback(
    async (keys: string[], signal?: AbortSignal): Promise<Map<string, StorableValue | null>> => {
      return withState(async () => {
        const url = buildKVUrl(config) + '/_mget'
        const result = await jsonFetch<Record<string, StorableValue | null>>(url, {
          method: 'POST',
          body: JSON.stringify({ keys }),
          signal,
        }, config.headers)

        return new Map(Object.entries(result))
      })
    },
    [config, withState]
  )

  const mset = useCallback(
    async (entries: Map<string, StorableValue>, signal?: AbortSignal): Promise<void> => {
      return withState(async () => {
        const url = buildKVUrl(config) + '/_mset'
        await jsonFetch<void>(url, {
          method: 'POST',
          body: JSON.stringify({ entries: Object.fromEntries(entries) }),
          signal,
        }, config.headers)
      })
    },
    [config, withState]
  )

  // -- Query operations ------------------------------------------------------

  const listKeys = useCallback(
    async (options?: KVListOptions, signal?: AbortSignal): Promise<KVListResult> => {
      return withState(async () => {
        const url = buildKVUrl(config)
        const params = new URLSearchParams()
        if (options?.prefix) params.set('prefix', options.prefix)
        if (options?.limit !== undefined) params.set('limit', String(options.limit))
        if (options?.cursor) params.set('cursor', options.cursor)
        const qs = params.toString()
        const fullUrl = qs ? `${url}?${qs}` : url
        return jsonFetch<KVListResult>(fullUrl, { method: 'GET', signal }, config.headers)
      })
    },
    [config, withState]
  )

  const count = useCallback(
    async (prefix?: string, signal?: AbortSignal): Promise<number> => {
      return withState(async () => {
        const url = buildKVUrl(config) + '/_count'
        return jsonFetch<number>(url, {
          method: 'POST',
          body: JSON.stringify({ prefix: prefix ?? '' }),
          signal,
        }, config.headers)
      })
    },
    [config, withState]
  )

  const clear = useCallback(
    async (signal?: AbortSignal): Promise<number> => {
      return withState(async () => {
        const url = buildKVUrl(config) + '/_clear'
        return jsonFetch<number>(url, { method: 'POST', signal }, config.headers)
      })
    },
    [config, withState]
  )

  const clearError = useCallback(() => setError(null), [])

  return {
    loading,
    error,
    get,
    set,
    remove,
    exists,
    listAdd,
    listGet,
    listRemove,
    listLength,
    listClear,
    mget,
    mset,
    list: listKeys,
    count,
    clear,
    clearError,
  }
}
