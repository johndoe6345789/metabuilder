'use client'

export {
  CardLoading,
  FormLoading,
  InlineLoading,
  ListLoading,
  TableLoading,
} from './loading-variants'
export type {
  FormLoadingProps,
  TableLoadingProps,
} from './loading-variants'
import type { LoadingSkeletonProps } from './loading-skeleton-types'
import { LoadingSkeletonError } from './loading-skeleton-error'
import { LoadingSkeletonVariant } from './loading-skeleton-variant'
export type { LoadingSkeletonProps } from './loading-skeleton-types'

/**
 * LoadingSkeleton Component - Unified loading state wrapper
 *
 * Combines multiple skeleton variants with a unified API for different content
 * types.
 * Automatically adapts to content type and provides a smooth loading
 * experience.
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
  if (error != null) {
    return (
      <LoadingSkeletonError
        error={error}
        errorComponent={errorComponent}
        className={className}
        style={style}
      />
    )
  }

  // Show skeleton during loading
  if (isLoading) {
    return (
      <LoadingSkeletonVariant
        variant={variant}
        rows={rows}
        columns={columns}
        count={count}
        className={className}
        style={style}
        width={width}
        height={height}
        animate={animate}
        loadingMessage={loadingMessage}
      />
    )
  }

  // Show children when not loading
  return <>{children}</>
}

/**
 * Specialized variants for common use cases
 */






/**
 * Form Loading Skeleton (multiple fields)
 */


/**
 * Export index for convenience
 */
export default LoadingSkeleton
