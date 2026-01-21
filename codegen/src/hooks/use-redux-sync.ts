import { useAppDispatch, useAppSelector } from '@/store'
import {
  syncToFlaskBulk,
  syncFromFlaskBulk,
  checkFlaskConnection,
  clearFlask,
  resetSyncStatus,
} from '@/store/slices/syncSlice'
import { useCallback, useEffect } from 'react'

export function useReduxSync() {
  const dispatch = useAppDispatch()
  const status = useAppSelector((state) => state.sync.status)
  const lastSyncedAt = useAppSelector((state) => state.sync.lastSyncedAt)
  const flaskConnected = useAppSelector((state) => state.sync.flaskConnected)
  const flaskStats = useAppSelector((state) => state.sync.flaskStats)
  const error = useAppSelector((state) => state.sync.error)
  const autoSync = useAppSelector((state) => state.settings.settings.autoSync)
  const syncInterval = useAppSelector((state) => state.settings.settings.syncInterval)

  const syncToFlask = useCallback(() => {
    dispatch(syncToFlaskBulk())
  }, [dispatch])

  const syncFromFlask = useCallback(() => {
    dispatch(syncFromFlaskBulk())
  }, [dispatch])

  const checkConnection = useCallback(() => {
    dispatch(checkFlaskConnection())
  }, [dispatch])

  const clearFlaskData = useCallback(() => {
    dispatch(clearFlask())
  }, [dispatch])

  const reset = useCallback(() => {
    dispatch(resetSyncStatus())
  }, [dispatch])

  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  useEffect(() => {
    if (autoSync && flaskConnected) {
      const interval = setInterval(() => {
        syncToFlask()
      }, syncInterval)

      return () => clearInterval(interval)
    }
  }, [autoSync, flaskConnected, syncInterval, syncToFlask])

  return {
    status,
    lastSyncedAt,
    flaskConnected,
    flaskStats,
    error,
    syncToFlask,
    syncFromFlask,
    checkConnection,
    clearFlaskData,
    reset,
  }
}
