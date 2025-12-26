'use client'

import { forwardRef, type ComponentProps } from 'react'
import { Skeleton as MuiSkeleton } from '@mui/material'

type MuiSkeletonProps = ComponentProps<typeof MuiSkeleton>

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
