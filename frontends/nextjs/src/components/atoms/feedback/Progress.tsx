'use client'

import {
  Box,
  CircularProgress,
  CircularProgressProps,
  LinearProgress,
  LinearProgressProps,
  Typography,
} from '@mui/material'
import { forwardRef } from 'react'

/**
 * Props for the Progress component
 * @extends {LinearProgressProps} Inherits Material-UI LinearProgress props
 */
export interface ProgressProps extends LinearProgressProps {
  /** Whether to display a percentage label next to the progress bar */
  showLabel?: boolean
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, showLabel, sx, ...props }, ref) => {
    if (showLabel && value !== undefined) {
      return (
        <Box ref={ref} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={value}
              sx={{ height: 8, borderRadius: 1, ...sx }}
              {...props}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
            {Math.round(value)}%
          </Typography>
        </Box>
      )
    }

    return (
      <LinearProgress
        ref={ref}
        value={value}
        variant={value !== undefined ? 'determinate' : 'indeterminate'}
        sx={{ height: 8, borderRadius: 1, ...sx }}
        {...props}
      />
    )
  }
)

Progress.displayName = 'Progress'

// Also export CircularProgress for convenience
export { CircularProgress,Progress }
