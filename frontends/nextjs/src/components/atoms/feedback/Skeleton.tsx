'use client'

import { forwardRef } from 'react'

import { Skeleton as FakemuiSkeleton } from '@/fakemui'
import type { SkeletonProps as FakemuiSkeletonProps } from '@/fakemui/fakemui/feedback/Skeleton'

/**
 * Props for the Skeleton component
 * Wrapper around fakemui Skeleton to maintain API compatibility
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Shape variant */
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded'
  /** Animation type */
  animation?: 'pulse' | 'wave' | false
  /** Width of the skeleton */
  width?: string | number
  /** Height of the skeleton */
  height?: string | number
  /** MUI sx prop - converted to className for compatibility */
  sx?: any
}

const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(
  ({ variant = 'rounded', animation = 'wave', width, height, sx, className, ...props }, ref) => {
    // Map MUI variant to fakemui variant
    const fakemuiVariant = variant === 'rounded' ? 'rectangular' : variant

    // Map MUI animation to fakemui animation
    const fakemuiAnimation = animation === 'wave' ? 'pulse' : animation

    // Combine className with any sx-based classes
    const combinedClassName = [className, sx?.className].filter(Boolean).join(' ')

    return (
      <FakemuiSkeleton
        ref={ref}
        variant={fakemuiVariant}
        animation={fakemuiAnimation}
        width={width}
        height={height}
        className={combinedClassName}
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

export { Skeleton }
