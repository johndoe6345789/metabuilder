'use client'

/** Ready-made skeletons for the shapes that recur: tables, cards, lists. */

export { FormLoading, InlineLoading } from './loading-inline-variants'
export type { FormLoadingProps } from './loading-inline-variants'
import { LoadingSkeleton } from './LoadingSkeleton'
import type { LoadingSkeletonProps } from './LoadingSkeleton'

export interface TableLoadingProps extends Omit<
  LoadingSkeletonProps,
  'variant'
> {
  rows?: number
  columns?: number
}


/**
 * Table Loading Skeleton
 */
export function TableLoading({
  rows = 5,
  columns = 4,
  isLoading = true,
  ...props
}: TableLoadingProps) {
  return (
    <LoadingSkeleton
      variant="table"
      rows={rows}
      columns={columns}
      isLoading={isLoading}
      {...props}
    >
      {props.children}
    </LoadingSkeleton>
  )
}

/**
 * Card Grid Loading Skeleton
 */
export function CardLoading({
  count = 3,
  isLoading = true,
  ...props
}: Omit<LoadingSkeletonProps, 'variant'>) {
  return (
    <LoadingSkeleton
      variant="card"
      count={count}
      isLoading={isLoading}
      {...props}
    >
      {props.children}
    </LoadingSkeleton>
  )
}

/**
 * List Loading Skeleton
 */
export function ListLoading({
  rows = 8,
  isLoading = true,
  ...props
}: Omit<LoadingSkeletonProps, 'variant'>) {
  return (
    <LoadingSkeleton
      variant="list"
      rows={rows}
      isLoading={isLoading}
      {...props}
    >
      {props.children}
    </LoadingSkeleton>
  )
}


