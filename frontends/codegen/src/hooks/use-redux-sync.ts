import { useAppDispatch, useAppSelector } from '@/store'
import {
  syncToDBALBulk,
  syncFromDBALBulk,
  checkDBALConnection,
  resetDBALStatus,
} from '@/store/slices/dbalSlice'
import { useCallback, useEffect } from 'react'

export function useReduxSync() {
  const dispatch = useAppDispatch()
  const status = useAppSelector((state) => state.dbal.status)
  const lastSyncedAt = useAppSelector((state) => state.dbal.lastSyncedAt)
  const dbalConnected = useAppSelector((state) => state.dbal.dbalConnected)
  const dbalStats = useAppSelector((state) => state.dbal.dbalConfig)
  const error = useAppSelector((state) => state.dbal.error)
  const autoSync = useAppSelector((state) => state.settings.settings.autoSync)
  const syncInterval = useAppSelector((state) => state.settings.settings.syncInterval)

  const syncToDBAL = useCallback(() => {
    ;(dispatch as any)(syncToDBALBulk())
  }, [dispatch])

  const syncFromDBAL = useCallback(() => {
    ;(dispatch as any)(syncFromDBALBulk())
  }, [dispatch])

  const checkConnection = useCallback(() => {
    ;(dispatch as any)(checkDBALConnection())
  }, [dispatch])

  const reset = useCallback(() => {
    dispatch(resetDBALStatus())
  }, [dispatch])

  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  useEffect(() => {
    if (autoSync && dbalConnected) {
      const interval = setInterval(() => {
        syncToDBAL()
      }, syncInterval)

      return () => clearInterval(interval)
    }
  }, [autoSync, dbalConnected, syncInterval, syncToDBAL])

  return {
    status,
    lastSyncedAt,
    dbalConnected,
    dbalStats,
    error,
    syncToDBAL,
    syncFromDBAL,
    checkConnection,
    reset,
  }
}
