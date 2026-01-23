import { useState, useCallback, useEffect } from 'react'

/**
 * Hook to trigger and monitor IMAP sync
 * Manages email synchronization with progress tracking
 */
export interface UseEmailSyncResult {
  /** Trigger email sync operation */
  sync: () => Promise<void>
  /** Whether sync is currently in progress */
  isSyncing: boolean
  /** Progress percentage (0-100) */
  progress: number
  /** Timestamp of last successful sync (ms) */
  lastSync: number | null
  /** Error object if sync failed */
  error: Error | null
}

interface SyncState {
  isSyncing: boolean
  progress: number
  lastSync: number | null
  error: Error | null
}

/**
 * Initializes email sync hook with progress tracking
 * @param options Sync configuration options
 * @returns Sync control and status interface
 */
export function useEmailSync(options?: {
  autoSync?: boolean
  syncInterval?: number
  onSyncComplete?: () => void
  onSyncError?: (error: Error) => void
}): UseEmailSyncResult {
  const [state, setState] = useState<SyncState>({
    isSyncing: false,
    progress: 0,
    lastSync: null,
    error: null,
  })

  /**
   * Trigger email sync
   * Simulates IMAP sync operation with progress tracking
   */
  const sync = useCallback(async () => {
    setState(prev => ({ ...prev, isSyncing: true, error: null }))

    try {
      // Simulate sync operation with progress updates
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setState(prev => ({ ...prev, progress: i }))
      }

      const now = Date.now()
      setState(prev => ({
        ...prev,
        isSyncing: false,
        progress: 100,
        lastSync: now,
        error: null,
      }))

      options?.onSyncComplete?.()
    } catch (error) {
      const syncError = error instanceof Error ? error : new Error('Sync failed')
      setState(prev => ({
        ...prev,
        isSyncing: false,
        error: syncError,
      }))
      options?.onSyncError?.(syncError)
    }
  }, [options])

  /**
   * Set up automatic sync interval
   */
  useEffect(() => {
    if (!options?.autoSync) return

    const interval = setInterval(
      () => {
        sync()
      },
      options?.syncInterval || 5 * 60 * 1000 // Default 5 minutes
    )

    return () => clearInterval(interval)
  }, [sync, options?.autoSync, options?.syncInterval])

  return {
    sync,
    isSyncing: state.isSyncing,
    progress: state.progress,
    lastSync: state.lastSync,
    error: state.error,
  }
}
