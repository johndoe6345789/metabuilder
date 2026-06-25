// fakemui/react/components/email/feedback/SyncProgress.tsx
import React from 'react'
import { Box, BoxProps, LinearProgress, Typography } from '../..'
import { useAccessible } from '../../../../hooks/useAccessible'

export interface SyncProgressProps extends BoxProps {
  progress: number
  totalMessages?: number
  syncedMessages?: number
  isVisible?: boolean
  testId?: string
}

export const SyncProgress = ({
  progress,
  totalMessages = 0,
  syncedMessages = 0,
  isVisible = true,
  testId: customTestId,
  ...props
}: SyncProgressProps) => {
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
