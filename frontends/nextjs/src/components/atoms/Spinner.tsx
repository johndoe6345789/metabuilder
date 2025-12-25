'use client'

import { forwardRef } from 'react'
import { CircularProgress, CircularProgressProps, Box } from '@mui/material'

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg'

export interface SpinnerProps extends Omit<CircularProgressProps, 'size'> {
  size?: SpinnerSize | number
  centered?: boolean
}

const sizeMap: Record<SpinnerSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 40,
}

const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', centered, ...props }, ref) => {
    const dimension = typeof size === 'number' ? size : sizeMap[size]
    
    const spinner = (
      <CircularProgress
        ref={ref}
        size={dimension}
        {...props}
      />
    )
    
    if (centered) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
          {spinner}
        </Box>
      )
    }
    
    return spinner
  }
)

Spinner.displayName = 'Spinner'

export { Spinner }
