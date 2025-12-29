'use client'

import { Skeleton as MuiSkeleton, SkeletonProps as MuiSkeletonProps } from '@mui/material'
import { forwardRef } from 'react'

/**
 * Props for the Skeleton component
 * @extends {MuiSkeletonProps} Inherits Material-UI Skeleton props
 */
export type SkeletonProps = MuiSkeletonProps

const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(({ sx, ...props }, ref) => {
  return (
    <MuiSkeleton
      ref={ref}
      animation="wave"
      sx={{
        bgcolor: 'action.hover',
        borderRadius: 1,
        ...sx,
      }}
      {...props}
    />
  )
})

Skeleton.displayName = 'Skeleton'

export { Skeleton }
