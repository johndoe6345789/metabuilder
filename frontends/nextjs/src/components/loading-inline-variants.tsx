'use client'

/** Skeletons for inline text and for a form. */

import { LoadingSkeleton } from './LoadingSkeleton'
import type { LoadingSkeletonProps } from './LoadingSkeleton'
import {
  Skeleton,
} from '@metabuilder/components'

export interface FormLoadingProps extends Omit<
  LoadingSkeletonProps,
  'variant'
> {
  fields?: number
}

/**
 * Inline Loading Skeleton (for buttons, small sections)
 */
export function InlineLoading({
  width = '100px',
  height = '20px',
  isLoading = true,
  ...props
}: Omit<LoadingSkeletonProps, 'variant'>) {
  return (
    <LoadingSkeleton
      variant="inline"
      width={width}
      height={height}
      isLoading={isLoading}
      {...props}
    >
      {props.children}
    </LoadingSkeleton>
  )
}

export function FormLoading({
  fields = 3,
  isLoading = true,
  ...props
}: FormLoadingProps) {
  if (!isLoading) {
    return <>{props.children}</>
  }

  return (
    <div
      className={`form-loading-skeleton ${props.className ?? ''}`}
      style={props.style}
    >
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} style={{ marginBottom: '24px' }}>
          <Skeleton
            width="100px"
            height="16px"
            animate={props.animate !== false}
            style={{ marginBottom: '8px' }}
          />
          <Skeleton
            width="100%"
            height="40px"
            animate={props.animate !== false}
          />
        </div>
      ))}
    </div>
  )
}
