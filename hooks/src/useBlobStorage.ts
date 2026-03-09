'use client'

/**
 * @file useBlobStorage.ts
 * @description Hook for blob storage operations via the C++ DBAL REST API.
 *
 * Replaces the TypeScript createBlobStorage() / TenantAwareBlobStorage pattern:
 *   const storage = createBlobStorage({ type: 's3', s3: { ... } })
 *   await storage.upload(key, data)
 *
 * With a REST-based hook:
 *   const blobs = useBlobStorage({ tenant: 'acme', packageId: 'media' })
 *   await blobs.upload(key, file, { contentType: 'image/png' })
 *
 * REST endpoints:
 *   GET    /api/v1/{tenant}/{package}/blob/{key}          - download
 *   PUT    /api/v1/{tenant}/{package}/blob/{key}          - upload
 *   DELETE /api/v1/{tenant}/{package}/blob/{key}          - delete
 *   HEAD   /api/v1/{tenant}/{package}/blob/{key}          - metadata / exists
 *   GET    /api/v1/{tenant}/{package}/blob?prefix=...     - list
 *   POST   /api/v1/{tenant}/{package}/blob/{key}/copy     - copy
 *   GET    /api/v1/{tenant}/{package}/blob/{key}/presign  - presigned URL
 *   GET    /api/v1/{tenant}/{package}/blob/_stats          - storage stats
 */

import { useState, useCallback } from 'react'
import type {
  DBALClientConfig,
  BlobMetadata,
  BlobListResult,
  BlobListOptions,
  BlobUploadOptions,
} from './types'
import { DBALError, DBALErrorCode } from './types'

// ---------------------------------------------------------------------------
// Hook return type
// ---------------------------------------------------------------------------

export interface UseBlobStorageReturn {
  /** Whether a request is in flight */
  loading: boolean
  /** Last error from a failed request */
  error: Error | null

  /** Upload data to blob storage */
  upload: (
    key: string,
    data: Blob | File | ArrayBuffer | Uint8Array,
    options?: BlobUploadOptions,
    signal?: AbortSignal
  ) => Promise<BlobMetadata>

  /** Download blob data */
  download: (key: string, signal?: AbortSignal) => Promise<Blob>

  /** Delete a blob */
  remove: (key: string, signal?: AbortSignal) => Promise<boolean>

  /** Check if a blob exists */
  exists: (key: string, signal?: AbortSignal) => Promise<boolean>

  /** Get blob metadata without downloading content */
  getMetadata: (key: string, signal?: AbortSignal) => Promise<BlobMetadata>

  /** List blobs with optional prefix filter */
  list: (options?: BlobListOptions, signal?: AbortSignal) => Promise<BlobListResult>

  /** Generate a presigned URL for temporary access */
  getPresignedUrl: (key: string, expirationSeconds?: number, signal?: AbortSignal) => Promise<string>

  /** Copy a blob to another key */
  copy: (sourceKey: string, destKey: string, signal?: AbortSignal) => Promise<BlobMetadata>

  /** Get total storage size in bytes */
  getTotalSize: (signal?: AbortSignal) => Promise<number>

  /** Get total number of objects */
  getObjectCount: (signal?: AbortSignal) => Promise<number>

  /** Clear the current error state */
  clearError: () => void
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildBlobUrl(config: DBALClientConfig, key?: string): string {
  const base = config.baseUrl ?? ''
  const tenant = config.tenant
  const pkg = config.packageId

  if (!tenant) {
    throw new DBALError(DBALErrorCode.VALIDATION_ERROR, 'Tenant is required for blob operations')
  }
  if (!pkg) {
    throw new DBALError(DBALErrorCode.VALIDATION_ERROR, 'Package is required for blob operations')
  }

  let url = `${base}/api/v1/${tenant}/${pkg}/blob`
  if (key) url += `/${encodeURIComponent(key)}`
  return url
}

async function handleError(response: Response): Promise<never> {
  let message: string
  try {
    const json = await response.json()
    message = json.error ?? json.message ?? `HTTP ${response.status}`
  } catch {
    message = `HTTP ${response.status}: ${response.statusText}`
  }
  throw DBALError.fromResponse(response.status, message)
}

// ---------------------------------------------------------------------------
// Hook implementation
// ---------------------------------------------------------------------------

/**
 * Hook for blob storage operations via the C++ DBAL REST API.
 *
 * @param config - DBAL client config (tenant, packageId, baseUrl, etc.)
 *
 * @example
 * const blobs = useBlobStorage({ tenant: 'acme', packageId: 'media' })
 *
 * // Upload a file
 * const meta = await blobs.upload('avatars/user-123.png', file, { contentType: 'image/png' })
 *
 * // Download
 * const blob = await blobs.download('avatars/user-123.png')
 *
 * // List with prefix
 * const { items } = await blobs.list({ prefix: 'avatars/' })
 */
export function useBlobStorage(config: DBALClientConfig = {}): UseBlobStorageReturn {
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

  const upload = useCallback(
    async (
      key: string,
      data: Blob | File | ArrayBuffer | Uint8Array,
      options?: BlobUploadOptions,
      signal?: AbortSignal
    ): Promise<BlobMetadata> => {
      return withState(async () => {
        const url = buildBlobUrl(config, key)
        const headers: Record<string, string> = {
          ...config.headers,
        }

        // Determine content type
        const contentType =
          options?.contentType ??
          (data instanceof File ? data.type : undefined) ??
          (data instanceof Blob ? data.type : undefined) ??
          'application/octet-stream'

        headers['Content-Type'] = contentType

        if (options?.overwrite !== undefined) {
          headers['X-Blob-Overwrite'] = String(options.overwrite)
        }
        if (options?.metadata) {
          headers['X-Blob-Metadata'] = JSON.stringify(options.metadata)
        }

        // Convert to Blob if needed
        const body =
          data instanceof Blob || data instanceof File
            ? data
            : new Blob([data as BlobPart])

        const response = await fetch(url, {
          method: 'PUT',
          headers,
          body,
          signal,
        })

        if (!response.ok) await handleError(response)
        return (await response.json()) as BlobMetadata
      })
    },
    [config, withState]
  )

  const download = useCallback(
    async (key: string, signal?: AbortSignal): Promise<Blob> => {
      return withState(async () => {
        const url = buildBlobUrl(config, key)
        const response = await fetch(url, {
          method: 'GET',
          headers: config.headers,
          signal,
        })

        if (!response.ok) await handleError(response)
        return response.blob()
      })
    },
    [config, withState]
  )

  const remove = useCallback(
    async (key: string, signal?: AbortSignal): Promise<boolean> => {
      return withState(async () => {
        const url = buildBlobUrl(config, key)
        const response = await fetch(url, {
          method: 'DELETE',
          headers: config.headers,
          signal,
        })

        if (!response.ok) await handleError(response)
        const json = await response.json()
        return json.success ?? json.deleted ?? true
      })
    },
    [config, withState]
  )

  const exists = useCallback(
    async (key: string, signal?: AbortSignal): Promise<boolean> => {
      return withState(async () => {
        const url = buildBlobUrl(config, key)
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

  const getMetadata = useCallback(
    async (key: string, signal?: AbortSignal): Promise<BlobMetadata> => {
      return withState(async () => {
        const url = buildBlobUrl(config, key)
        const response = await fetch(url, {
          method: 'HEAD',
          headers: config.headers,
          signal,
        })

        if (!response.ok) await handleError(response)

        return {
          key,
          size: parseInt(response.headers.get('content-length') ?? '0', 10),
          contentType: response.headers.get('content-type') ?? 'application/octet-stream',
          etag: response.headers.get('etag') ?? '',
          lastModified: response.headers.get('last-modified') ?? new Date().toISOString(),
          customMetadata: (() => {
            const raw = response.headers.get('x-blob-metadata')
            if (!raw) return undefined
            try {
              return JSON.parse(raw)
            } catch {
              return undefined
            }
          })(),
        }
      })
    },
    [config, withState]
  )

  const listBlobs = useCallback(
    async (options?: BlobListOptions, signal?: AbortSignal): Promise<BlobListResult> => {
      return withState(async () => {
        const url = buildBlobUrl(config)
        const params = new URLSearchParams()

        if (options?.prefix) params.set('prefix', options.prefix)
        if (options?.continuationToken) params.set('continuationToken', options.continuationToken)
        if (options?.maxKeys !== undefined) params.set('maxKeys', String(options.maxKeys))

        const qs = params.toString()
        const fullUrl = qs ? `${url}?${qs}` : url

        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: { Accept: 'application/json', ...config.headers },
          signal,
        })

        if (!response.ok) await handleError(response)
        return (await response.json()) as BlobListResult
      })
    },
    [config, withState]
  )

  const getPresignedUrl = useCallback(
    async (key: string, expirationSeconds?: number, signal?: AbortSignal): Promise<string> => {
      return withState(async () => {
        const url = buildBlobUrl(config, key) + '/presign'
        const params = new URLSearchParams()
        if (expirationSeconds !== undefined) {
          params.set('expires', String(expirationSeconds))
        }
        const qs = params.toString()
        const fullUrl = qs ? `${url}?${qs}` : url

        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: { Accept: 'application/json', ...config.headers },
          signal,
        })

        if (!response.ok) await handleError(response)
        const json = await response.json()
        return json.url ?? json.presignedUrl ?? ''
      })
    },
    [config, withState]
  )

  const copy = useCallback(
    async (sourceKey: string, destKey: string, signal?: AbortSignal): Promise<BlobMetadata> => {
      return withState(async () => {
        const url = buildBlobUrl(config, sourceKey) + '/copy'
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...config.headers },
          body: JSON.stringify({ destKey }),
          signal,
        })

        if (!response.ok) await handleError(response)
        return (await response.json()) as BlobMetadata
      })
    },
    [config, withState]
  )

  const getTotalSize = useCallback(
    async (signal?: AbortSignal): Promise<number> => {
      return withState(async () => {
        const url = buildBlobUrl(config) + '/_stats'
        const response = await fetch(url, {
          method: 'GET',
          headers: { Accept: 'application/json', ...config.headers },
          signal,
        })

        if (!response.ok) await handleError(response)
        const json = await response.json()
        return json.totalSize ?? json.totalSizeBytes ?? 0
      })
    },
    [config, withState]
  )

  const getObjectCount = useCallback(
    async (signal?: AbortSignal): Promise<number> => {
      return withState(async () => {
        const url = buildBlobUrl(config) + '/_stats'
        const response = await fetch(url, {
          method: 'GET',
          headers: { Accept: 'application/json', ...config.headers },
          signal,
        })

        if (!response.ok) await handleError(response)
        const json = await response.json()
        return json.objectCount ?? json.count ?? 0
      })
    },
    [config, withState]
  )

  const clearError = useCallback(() => setError(null), [])

  return {
    loading,
    error,
    upload,
    download,
    remove,
    exists,
    getMetadata,
    list: listBlobs,
    getPresignedUrl,
    copy,
    getTotalSize,
    getObjectCount,
    clearError,
  }
}
