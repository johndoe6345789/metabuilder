'use client'

import { CSSProperties,forwardRef } from 'react'

import { Skeleton as FakemuiSkeleton, SkeletonProps as FakemuiSkeletonProps } from '@/fakemui/fakemui/feedback'

import styles from './Skeleton.module.scss'

/**
 * Props for the Skeleton component
 * @extends {FakemuiSkeletonProps} Inherits fakemui Skeleton props
 */
export interface SkeletonProps extends FakemuiSkeletonProps {
  /** Custom inline styles */
  style?: CSSProperties
}

const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(({ className, style, ...props }, ref) => {
  return (
    <FakemuiSkeleton
      ref={ref}
      animation="wave"
      className={`${styles.skeleton} ${className || ''}`}
      style={style}
      {...props}
    />
  )
})

Skeleton.displayName = 'Skeleton'

export { Skeleton }
