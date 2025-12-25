'use client'

import { forwardRef } from 'react'
import { Skeleton as MuiSkeleton, SkeletonProps as MuiSkeletonProps } from '@mui/material'

export interface SkeletonProps extends MuiSkeletonProps {
  className?: string
}

const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(
  ({ variant = 'rounded', animation = 'wave', ...props }, ref) => {
    return (
      <MuiSkeleton
        ref={ref}
        variant={variant}
        animation={animation}
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

export { Skeleton }
