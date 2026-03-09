'use client'

/**
 * @file useOfflineSync.ts
 * @description React hook that orchestrates offline/online sync for the DBAL layer.
 *
 * Monitors REST API reachability by polling the health endpoint, tracks
 * the sync queue size, and automatically flushes pending mutations when
 * connectivity is restored.
 *
 * Conflict strategy: last-write-wins (server response overwrites local IndexedDB).
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { DBALClientConfig, OfflineSyncState, SyncQueueEntry } from './types'
import { OfflineStore } from './useIndexedDB'
import { SyncQueue } from './useSyncQueue'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default polling interval for health checks (milliseconds) */
const POLL_INTERVAL_MS = 30_000

/** Timeout for a single health check ping (milliseconds) */
const HEALTH_TIMEOUT_MS = 5_000

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export interface UseOfflineSyncReturn extends OfflineSyncState {
  /** Manually trigger a sync flush of all pending mutations */
  syncNow: () => Promise<number>
  /** Discard all pending mutations in the sync queue */
  clearQueue: () => Promise<void>
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * React hook for managing offline/online sync state.
 *
 * Polls the DBAL REST API health endpoint to detect connectivity.
 * When transitioning from offline to online, automatically flushes the
 * sync queue. Consumers can also trigger manual sync via `syncNow()`.
 *
 * @param config - DBAL client configuration (baseUrl, tenant, etc.)
 * @returns Sync state and control functions
 *
 * @example
 * const { isOnline, pendingCount, lastSyncAt, syncNow, clearQueue } = useOfflineSync({
 *   baseUrl: 'http://localhost:8080',
 *   tenant: 'acme',
 *   packageId: 'core',
 * })
 *
 * if (!isOnline) {
 *   console.log(`Offline. ${pendingCount} mutations pending.`)
 * }
 */
export function useOfflineSync(config: DBALClientConfig = {}): UseOfflineSyncReturn {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null)

  const configRef = useRef(config)
  configRef.current = config

  const isFlushing = useRef(false)
  const wasOnlineRef = useRef(true)

  // -------------------------------------------------------------------------
  // Health check
  // -------------------------------------------------------------------------

  const checkHealth = useCallback(async (): Promise<boolean> => {
    const baseUrl = configRef.current.baseUrl ?? ''
    const healthUrl = `${baseUrl}/health`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS)

    try {
      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })
      return response.ok
    } catch {
      return false
    } finally {
      clearTimeout(timeoutId)
    }
  }, [])

  // -------------------------------------------------------------------------
  // Sync flush
  // -------------------------------------------------------------------------

  /**
   * Execute a single queued mutation against the REST API.
   */
  const executeMutation = useCallback(
    async (
      entity: string,
      operation: SyncQueueEntry['operation'],
      data: Record<string, unknown>
    ): Promise<unknown> => {
      const cfg = configRef.current
      const baseUrl = cfg.baseUrl ?? ''
      const tenant = cfg.tenant ?? ''
      const pkg = cfg.packageId ?? ''

      let method: string
      let url: string
      let body: string | undefined

      switch (operation) {
        case 'create':
          method = 'POST'
          url = `${baseUrl}/api/v1/${tenant}/${pkg}/${entity}`
          body = JSON.stringify(data)
          break
        case 'update':
          method = 'PUT'
          url = `${baseUrl}/api/v1/${tenant}/${pkg}/${entity}/${data.id as string}`
          body = JSON.stringify(data)
          break
        case 'delete':
          method = 'DELETE'
          url = `${baseUrl}/api/v1/${tenant}/${pkg}/${entity}/${data.id as string}`
          break
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...cfg.headers,
      }

      const response = await fetch(url!, {
        method: method!,
        headers,
        body,
      })

      if (!response.ok) {
        throw new Error(`Sync failed: HTTP ${response.status}`)
      }

      const result = await response.json()

      // Last-write-wins: update local IndexedDB with server response
      if (operation !== 'delete' && result?.data) {
        const store = OfflineStore.getInstance()
        await store.put(entity, {
          ...result.data,
          id: (result.data.id as string) ?? (data.id as string),
          _syncStatus: 'synced',
        })
      } else if (operation === 'delete') {
        const store = OfflineStore.getInstance()
        await store.delete(entity, data.id as string)
      }

      return result
    },
    []
  )

  const syncNow = useCallback(async (): Promise<number> => {
    if (isFlushing.current) return 0
    isFlushing.current = true

    try {
      const queue = SyncQueue.getInstance()
      const flushed = await queue.flush(executeMutation)

      if (flushed > 0) {
        setLastSyncAt(new Date())
      }

      // Update pending count
      const remaining = await queue.count()
      setPendingCount(remaining)

      return flushed
    } finally {
      isFlushing.current = false
    }
  }, [executeMutation])

  const clearQueue = useCallback(async (): Promise<void> => {
    const queue = SyncQueue.getInstance()
    await queue.clear()
    setPendingCount(0)
  }, [])

  // -------------------------------------------------------------------------
  // Polling loop
  // -------------------------------------------------------------------------

  useEffect(() => {
    let mounted = true

    const poll = async () => {
      if (!mounted) return

      const online = await checkHealth()

      if (!mounted) return

      setIsOnline(online)

      // Detect offline -> online transition and auto-flush
      if (online && !wasOnlineRef.current) {
        syncNow()
      }
      wasOnlineRef.current = online

      // Update pending count
      const queue = SyncQueue.getInstance()
      const count = await queue.count()
      if (mounted) {
        setPendingCount(count)
      }
    }

    // Initial check
    poll()

    // Set up polling interval
    const intervalId = setInterval(poll, POLL_INTERVAL_MS)

    return () => {
      mounted = false
      clearInterval(intervalId)
    }
  }, [checkHealth, syncNow])

  return {
    isOnline,
    pendingCount,
    lastSyncAt,
    syncNow,
    clearQueue,
  }
}
