'use client'

import React from 'react'
import { Skeleton, TableSkeleton, CardSkeleton, ListSkeleton } from '@metabuilder/components'

/**
 * LoadingSkeleton Component - Unified loading state wrapper
 *
 * Combines multiple skeleton variants with a unified API for different content types.
 * Automatically adapts to content type and provides a smooth loading experience.
 *
 * @example
 * ```tsx
 * <LoadingSkeleton
 *   isLoading={isLoading}
 *   variant="table"
 *   rows={5}
 *   columns={4}
 * >
 *   {children}
 * </LoadingSkeleton>
 * ```
 */

export interface LoadingSkeletonProps {
  /**
   * Whether to show the skeleton loading state
   * @default true
   */
  isLoading?: boolean

  /**
   * Type of skeleton to display
   * @default 'block'
   */
  variant?: 'block' | 'table' | 'card' | 'list' | 'inline'

  /**
   * Number of rows (for table/list variants)
   * @default 5
   */
  rows?: number

  /**
   * Number of columns (for table variant only)
   * @default 4
   */
  columns?: number

  /**
   * Number of items (for card variant)
   * @default 3
   */
  count?: number

  /**
   * Width of skeleton (for block variant)
   * @default '100%'
   */
  width?: string | number

  /**
   * Height of skeleton (for block variant)
   * @default '20px'
   */
  height?: string | number

  /**
   * Whether to show animation
   * @default true
   */
  animate?: boolean

  /**
   * CSS class name for custom styling
   */
  className?: string

  /**
   * Custom style overrides
   */
  style?: React.CSSProperties

  /**
   * Error state to display instead of skeleton
   */
  error?: Error | string | null

  /**
   * Error component to display
   */
  errorComponent?: React.ReactNode

  /**
   * Loading message to display
   */
  loadingMessage?: string

  /**
   * Children to render when loading is complete
   */
  children: React.ReactNode
}

/**
 * LoadingSkeleton - Unified skeleton wrapper with multiple variants
 *
 * Handles loading, error, and loaded states with appropriate UI feedback.
 */
export function LoadingSkeleton({
  isLoading = true,
  variant = 'block',
  rows = 5,
  columns = 4,
  count = 3,
  width = '100%',
  height = '20px',
  animate = true,
  className,
  style,
  error,
  errorComponent,
  loadingMessage,
  children,
}: LoadingSkeletonProps) {
  // Show error state if error exists
  if (error) {
    return (
      errorComponent ?? (
        <div
          className={`loading-skeleton-error ${className ?? ''}`}
          style={{
            padding: '16px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            color: '#991b1b',
            ...style,
          }}
        >
          <strong>Error:</strong> {typeof error === 'string' ? error : error.message}
        </div>
      )
    )
  }

  // Show skeleton during loading
  if (isLoading) {
    switch (variant) {
      case 'table':
        return <TableSkeleton rows={rows} columns={columns} className={className} />

      case 'card':
        return <CardSkeleton count={count} className={className} />

      case 'list':
        return <ListSkeleton count={rows} className={className} />

      case 'inline':
        return (
          <div className={`loading-skeleton-inline ${className ?? ''}`} style={{ display: 'inline-block', ...style }}>
            <Skeleton
              width={width === '100%' ? '120px' : width}
              height={height}
              animate={animate}
              className={className}
            />
            {loadingMessage && <span style={{ marginLeft: '8px' }}>{loadingMessage}</span>}
          </div>
        )

      case 'block':
      default:
        return (
          <div className={`loading-skeleton-block ${className ?? ''}`} style={style}>
            <Skeleton width={width} height={height} animate={animate} className={className} />
            {loadingMessage && <p style={{ marginTop: '12px', color: '#666', fontSize: '14px' }}>{loadingMessage}</p>}
          </div>
        )
    }
  }

  // Show children when not loading
  return <>{children}</>
}

/**
 * Specialized variants for common use cases
 */

export interface TableLoadingProps extends Omit<LoadingSkeletonProps, 'variant'> {
  rows?: number
  columns?: number
}

/**
 * Table Loading Skeleton
 */
export function TableLoading({ rows = 5, columns = 4, isLoading = true, ...props }: TableLoadingProps) {
  return (
    <LoadingSkeleton variant="table" rows={rows} columns={columns} isLoading={isLoading} {...props}>
      {props.children}
    </LoadingSkeleton>
  )
}

/**
 * Card Grid Loading Skeleton
 */
export function CardLoading({ count = 3, isLoading = true, ...props }: Omit<LoadingSkeletonProps, 'variant'>) {
  return (
    <LoadingSkeleton variant="card" count={count} isLoading={isLoading} {...props}>
      {props.children}
    </LoadingSkeleton>
  )
}

/**
 * List Loading Skeleton
 */
export function ListLoading({ rows = 8, isLoading = true, ...props }: Omit<LoadingSkeletonProps, 'variant'>) {
  return (
    <LoadingSkeleton variant="list" rows={rows} isLoading={isLoading} {...props}>
      {props.children}
    </LoadingSkeleton>
  )
}

/**
 * Inline Loading Skeleton (for buttons, small sections)
 */
export function InlineLoading({ width = '100px', height = '20px', isLoading = true, ...props }: Omit<LoadingSkeletonProps, 'variant'>) {
  return (
    <LoadingSkeleton variant="inline" width={width} height={height} isLoading={isLoading} {...props}>
      {props.children}
    </LoadingSkeleton>
  )
}

/**
 * Form Loading Skeleton (multiple fields)
 */
export interface FormLoadingProps extends Omit<LoadingSkeletonProps, 'variant'> {
  fields?: number
}

export function FormLoading({ fields = 3, isLoading = true, ...props }: FormLoadingProps) {
  if (!isLoading) {
    return <>{props.children}</>
  }

  return (
    <div className={`form-loading-skeleton ${props.className ?? ''}`} style={props.style}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} style={{ marginBottom: '24px' }}>
          <Skeleton width="100px" height="16px" animate={props.animate !== false} style={{ marginBottom: '8px' }} />
          <Skeleton width="100%" height="40px" animate={props.animate !== false} />
        </div>
      ))}
    </div>
  )
}

/**
 * Export index for convenience
 */
export default LoadingSkeleton
