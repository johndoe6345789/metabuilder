// fakemui/react/components/email/feedback/SyncStatusBadge.tsx
import React from 'react'
import { Box, BoxProps, Chip } from '../..'
import { useAccessible } from '../../../../hooks/useAccessible'

export type SyncStatus = 'syncing' | 'synced' | 'error' | 'idle'

export interface SyncStatusBadgeProps extends BoxProps {
  status: SyncStatus
  lastSyncAt?: number
  errorMessage?: string
  testId?: string
}

export const SyncStatusBadge = ({
  status,
  lastSyncAt,
  errorMessage,
  testId: customTestId,
  ...props
}: SyncStatusBadgeProps) => {
  const accessible = useAccessible({
    feature: 'email',
    component: 'sync-badge',
    identifier: customTestId || status
  })

  const getStatusLabel = () => {
    switch (status) {
      case 'syncing':
        return 'Syncing...'
      case 'synced':
        return `Last sync: ${lastSyncAt ? new Date(lastSyncAt).toLocaleTimeString() : 'now'}`
      case 'error':
        return `Sync failed: ${errorMessage || 'Unknown error'}`
      case 'idle':
        return 'Idle'
      default:
        return 'Unknown'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'syncing':
        return 'info'
      case 'synced':
        return 'success'
      case 'error':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Box
      className="sync-status-badge"
      {...accessible}
      {...props}
    >
      <Chip
        label={getStatusLabel()}
        color={getStatusColor()}
        size="small"
      />
    </Box>
  )
}
