// fakemui/react/components/email/feedback/SyncStatusBadge.tsx
import React, { forwardRef } from 'react'
import { Box, BoxProps, Chip } from '../..'
import { useAccessible } from '@metabuilder/fakemui/hooks'

export type SyncStatus = 'syncing' | 'synced' | 'error' | 'idle'

export interface SyncStatusBadgeProps extends BoxProps {
  status: SyncStatus
  lastSyncAt?: number
  errorMessage?: string
  testId?: string
}

export const SyncStatusBadge = forwardRef<HTMLDivElement, SyncStatusBadgeProps>(
  ({ status, lastSyncAt, errorMessage, testId: customTestId, ...props }, ref) => {
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
        ref={ref}
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
)

SyncStatusBadge.displayName = 'SyncStatusBadge'
