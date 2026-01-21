import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { usePersistence } from '@/hooks/use-persistence'
import { useAppDispatch } from '@/store'
import {
  syncToFlaskBulk,
  syncFromFlaskBulk,
  checkFlaskConnection,
} from '@/store/slices/syncSlice'
import copy from '@/data/persistence-dashboard.json'

const useFlaskConnectionPolling = (dispatch: ReturnType<typeof useAppDispatch>) => {
  useEffect(() => {
    dispatch(checkFlaskConnection())
    const interval = setInterval(() => {
      dispatch(checkFlaskConnection())
    }, 10000)

    return () => clearInterval(interval)
  }, [dispatch])
}

export function usePersistenceDashboard() {
  const dispatch = useAppDispatch()
  const { status, metrics, autoSyncStatus, syncNow, configureAutoSync } = usePersistence()
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false)
  const [syncing, setSyncing] = useState(false)

  useFlaskConnectionPolling(dispatch)

  const handleSyncToFlask = async () => {
    setSyncing(true)
    try {
      await dispatch(syncToFlaskBulk()).unwrap()
      toast.success(copy.toasts.syncToSuccess)
    } catch (error: any) {
      toast.error(copy.toasts.syncFailed.replace('{{error}}', String(error)))
    } finally {
      setSyncing(false)
    }
  }

  const handleSyncFromFlask = async () => {
    setSyncing(true)
    try {
      await dispatch(syncFromFlaskBulk()).unwrap()
      toast.success(copy.toasts.syncFromSuccess)
    } catch (error: any) {
      toast.error(copy.toasts.syncFailed.replace('{{error}}', String(error)))
    } finally {
      setSyncing(false)
    }
  }

  const handleAutoSyncToggle = (enabled: boolean) => {
    setAutoSyncEnabled(enabled)
    configureAutoSync({ enabled, syncOnChange: true })
    toast.info(enabled ? copy.toasts.autoSyncEnabled : copy.toasts.autoSyncDisabled)
  }

  const handleManualSync = async () => {
    try {
      await syncNow()
      toast.success(copy.toasts.manualSyncSuccess)
    } catch (error: any) {
      toast.error(copy.toasts.manualSyncFailed.replace('{{error}}', String(error)))
    }
  }

  const handleCheckConnection = () => {
    dispatch(checkFlaskConnection())
  }

  const flags = {
    isConnected: status.flaskConnected,
    isSyncing: syncing,
    hasError: Boolean(status.error),
    canSyncToFlask: status.flaskConnected && !syncing,
    canSyncFromFlask: status.flaskConnected && !syncing,
    canTriggerManualSync: autoSyncStatus.enabled && !syncing,
  }

  const handlers = {
    handleSyncToFlask,
    handleSyncFromFlask,
    handleManualSync,
    handleAutoSyncToggle,
    handleCheckConnection,
  }

  return {
    status,
    metrics,
    autoSyncStatus,
    autoSyncEnabled,
    flags,
    handlers,
  }
}
