'use client'

import { forwardRef } from 'react'
import { LinearProgress, LinearProgressProps, CircularProgress, CircularProgressProps } from '@mui/material'

export interface ProgressProps extends LinearProgressProps {
  value?: number
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, sx, ...props }, ref) => {
    return (
      <LinearProgress
        ref={ref}
        variant={value !== undefined ? 'determinate' : 'indeterminate'}
        value={value}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: 'action.hover',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
          },
          ...sx,
        }}
        {...props}
      />
    )
  }
)

Progress.displayName = 'Progress'

export { Progress }
