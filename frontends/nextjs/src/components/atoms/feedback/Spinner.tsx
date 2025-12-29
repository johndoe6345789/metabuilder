'use client'

import { forwardRef } from 'react'
import { CircularProgress, CircularProgressProps, Box } from '@mui/material'

/** Spinner size options */
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg'

/**
 * Props for the Spinner component
 * @extends {CircularProgressProps} Inherits Material-UI CircularProgress props
 */
export interface SpinnerProps extends Omit<CircularProgressProps, 'size'> {
  /** Size of the spinner (xs: 16px, sm: 20px, md: 24px, lg: 40px) or a custom number */
  size?: SpinnerSize | number
  /** Whether to center the spinner in its container */
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

    const spinner = <CircularProgress ref={ref} size={dimension} {...props} />

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
