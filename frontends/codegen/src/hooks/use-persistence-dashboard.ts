import { useEffect, useState } from 'react'
import { toast } from '@/components/ui/sonner'
import { usePersistence } from '@/hooks/use-persistence'
import { useAppDispatch } from '@/store'
import {
  syncToDBALBulk,
  syncFromDBALBulk,
  checkDBALConnection,
} from '@/store/slices/dbalSlice'
import copy from '@/data/persistence-dashboard.json'

const useDBALConnectionPolling = (dispatch: ReturnType<typeof useAppDispatch>) => {
  useEffect(() => {
    ;(dispatch as any)(checkDBALConnection())
    const interval = setInterval(() => {
      ;(dispatch as any)(checkDBALConnection())
    }, 10000)

    return () => clearInterval(interval)
  }, [dispatch])
}

export function usePersistenceDashboard() {
  const dispatch = useAppDispatch()
  const { status, metrics, autoSyncStatus, syncNow, configureAutoSync } = usePersistence()
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false)
  const [syncing, setSyncing] = useState(false)

  useDBALConnectionPolling(dispatch)

  const handleSyncToDBAL = async () => {
    setSyncing(true)
    try {
      await (dispatch as any)(syncToDBALBulk()).unwrap()
      toast.success(copy.toasts.syncToSuccess)
    } catch (error: any) {
      toast.error(copy.toasts.syncFailed.replace('{{error}}', String(error)))
    } finally {
      setSyncing(false)
    }
  }

  const handleSyncFromDBAL = async () => {
    setSyncing(true)
    try {
      await (dispatch as any)(syncFromDBALBulk()).unwrap()
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
    ;(dispatch as any)(checkDBALConnection())
  }

  const flags = {
    isConnected: status.dbalConnected,
    isSyncing: syncing,
    hasError: Boolean(status.error),
    canSyncToDBAL: status.dbalConnected && !syncing,
    canSyncFromDBAL: status.dbalConnected && !syncing,
    canTriggerManualSync: autoSyncStatus.enabled && !syncing,
  }

  const handlers = {
    handleSyncToDBAL,
    handleSyncFromDBAL,
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
