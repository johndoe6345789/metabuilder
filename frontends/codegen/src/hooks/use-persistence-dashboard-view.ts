import { usePersistenceDashboard } from './use-persistence-dashboard'
import { usePersistence } from './use-persistence'
import copy from '@/data/persistence-dashboard.json'

type PersistenceStatus = ReturnType<typeof usePersistence>['status']
type PersistenceMetrics = ReturnType<typeof usePersistence>['metrics']

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

const getStatusColor = (status: PersistenceStatus): string => {
  if (!status.dbalConnected) return 'bg-destructive'
  if (status.syncStatus === 'syncing') return 'bg-amber-500'
  if (status.syncStatus === 'success') return 'bg-accent'
  if (status.syncStatus === 'error') return 'bg-destructive'
  return 'bg-muted'
}

const getStatusText = (status: PersistenceStatus): string => {
  if (!status.dbalConnected) return copy.status.disconnected
  if (status.syncStatus === 'syncing') return copy.status.syncing
  if (status.syncStatus === 'success') return copy.status.synced
  if (status.syncStatus === 'error') return copy.status.error
  return copy.status.idle
}

const formatTime = (timestamp: number | null): string => {
  if (!timestamp) return copy.format.never
  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}

const getSuccessRate = (metrics: PersistenceMetrics): number => {
  if (metrics.totalOperations === 0) return 0
  return Math.round((metrics.successfulOperations / metrics.totalOperations) * 100)
}

export function usePersistenceDashboardView() {
  const { status, metrics, autoSyncStatus, autoSyncEnabled, flags, handlers } =
    usePersistenceDashboard()

  const statusColor = getStatusColor(status)
  const statusText = getStatusText(status)
  const lastSyncFormatted = formatTime(status.lastSyncTime)
  const successRate = getSuccessRate(metrics)
  const avgDurationFormatted = formatDuration(metrics.averageOperationTime)
  const nextSyncFormatted =
    autoSyncStatus.nextSyncIn !== null
      ? formatDuration(autoSyncStatus.nextSyncIn)
      : copy.cards.autoSync.nextSyncNotAvailable

  const remoteStorageText = status.dbalConnected
    ? copy.cards.connection.remoteStorageConnected
    : copy.cards.connection.remoteStorageDisconnected

  const autoSyncStatusText = autoSyncStatus.enabled
    ? copy.cards.autoSync.statusEnabled
    : copy.cards.autoSync.statusDisabled

  const statusBadgeClassName = `${statusColor} text-white`

  return {
    status,
    metrics,
    autoSyncStatus,
    autoSyncEnabled,
    flags,
    handlers,
    statusColor,
    statusText,
    statusBadgeClassName,
    lastSyncFormatted,
    successRate,
    avgDurationFormatted,
    nextSyncFormatted,
    remoteStorageText,
    autoSyncStatusText,
    copy,
  }
}
