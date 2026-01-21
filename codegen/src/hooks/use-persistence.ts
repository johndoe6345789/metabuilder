import { useEffect, useState } from 'react'
import { useAppSelector } from '@/store'
import { 
  flushPersistence, 
  configurePersistence, 
  enablePersistence, 
  disablePersistence 
} from '@/store/middleware/persistenceMiddleware'
import { 
  getSyncMetrics, 
  resetSyncMetrics, 
  subscribeSyncMetrics 
} from '@/store/middleware/syncMonitorMiddleware'
import {
  configureAutoSync,
  getAutoSyncStatus,
  triggerAutoSync
} from '@/store/middleware/autoSyncMiddleware'

interface PersistenceStatus {
  enabled: boolean
  lastSyncTime: number | null
  syncStatus: 'idle' | 'syncing' | 'success' | 'error'
  error: string | null
  flaskConnected: boolean
}

interface SyncMetrics {
  totalOperations: number
  successfulOperations: number
  failedOperations: number
  lastOperationTime: number
  averageOperationTime: number
}

interface AutoSyncStatus {
  enabled: boolean
  lastSyncTime: number
  changeCounter: number
  nextSyncIn: number | null
}

export function usePersistence() {
  const syncState = useAppSelector((state) => state.sync)
  const [metrics, setMetrics] = useState<SyncMetrics>(getSyncMetrics())
  const [autoSyncStatus, setAutoSyncStatus] = useState<AutoSyncStatus>(getAutoSyncStatus())

  useEffect(() => {
    const unsubscribe = subscribeSyncMetrics((newMetrics) => {
      setMetrics(newMetrics)
    })

    const statusTimer = setInterval(() => {
      setAutoSyncStatus(getAutoSyncStatus())
    }, 1000)

    return () => {
      unsubscribe()
      clearInterval(statusTimer)
    }
  }, [])

  const status: PersistenceStatus = {
    enabled: true,
    lastSyncTime: syncState.lastSyncedAt,
    syncStatus: syncState.status,
    error: syncState.error,
    flaskConnected: syncState.flaskConnected,
  }

  const flush = async () => {
    await flushPersistence()
  }

  const configure = (sliceName: string, config: any) => {
    configurePersistence(sliceName, config)
  }

  const enable = (sliceName: string) => {
    enablePersistence(sliceName)
  }

  const disable = (sliceName: string) => {
    disablePersistence(sliceName)
  }

  const resetMetrics = () => {
    resetSyncMetrics()
  }

  const configureAutoSyncSettings = (config: any) => {
    configureAutoSync(config)
  }

  const syncNow = async () => {
    await triggerAutoSync()
  }

  return {
    status,
    metrics,
    autoSyncStatus,
    flush,
    configure,
    enable,
    disable,
    resetMetrics,
    configureAutoSync: configureAutoSyncSettings,
    syncNow,
  }
}
