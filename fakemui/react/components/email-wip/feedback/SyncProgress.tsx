// fakemui/react/components/email/feedback/SyncProgress.tsx
import React, { forwardRef } from 'react'
import { Box, BoxProps, LinearProgress, Typography } from '..'
import { useAccessible } from '@metabuilder/fakemui/hooks'

export interface SyncProgressProps extends BoxProps {
  progress: number
  totalMessages?: number
  syncedMessages?: number
  isVisible?: boolean
  testId?: string
}

export const SyncProgress = forwardRef<HTMLDivElement, SyncProgressProps>(
  (
    {
      progress,
      totalMessages = 0,
      syncedMessages = 0,
      isVisible = true,
      testId: customTestId,
      ...props
    },
    ref
  ) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'sync-progress',
      identifier: customTestId || 'progress'
    })

    if (!isVisible) {
      return null
    }

    return (
      <Box
        ref={ref}
        className="sync-progress"
        {...accessible}
        {...props}
      >
        <Typography variant="body2">
          Syncing... {syncedMessages} of {totalMessages} messages
        </Typography>
        <LinearProgress variant="determinate" value={progress} />
        <Typography variant="caption">
          {Math.round(progress)}% complete
        </Typography>
      </Box>
    )
  }
)

SyncProgress.displayName = 'SyncProgress'
