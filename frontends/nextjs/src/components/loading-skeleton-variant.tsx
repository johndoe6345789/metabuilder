'use client'

/** Picks the skeleton shape for a variant. */

import {
  CardSkeleton,
  ListSkeleton,
  Skeleton,
  TableSkeleton,
} from '@metabuilder/components'
import type { LoadingSkeletonProps } from './loading-skeleton-types'

export function LoadingSkeletonVariant({
  variant,
  rows,
  columns,
  count,
  className,
  style,
  width,
  height,
  animate,
  loadingMessage,
}: Pick<
  LoadingSkeletonProps,
  | 'variant'
  | 'rows'
  | 'columns'
  | 'count'
  | 'className'
  | 'style'
  | 'width'
  | 'height'
  | 'animate'
  | 'loadingMessage'
>) {
  switch (variant) {
    case 'table':
      return (
        <TableSkeleton rows={rows} columns={columns} className={className} />
      )

    case 'card':
      return <CardSkeleton count={count} className={className} />

    case 'list':
      return <ListSkeleton count={rows} className={className} />

    case 'inline':
      return (
        <div
          className={`loading-skeleton-inline ${className ?? ''}`}
          style={{ display: 'inline-block', ...style }}
        >
          <Skeleton
            width={width === '100%' ? '120px' : width}
            height={height}
            animate={animate}
            className={className}
          />
          {loadingMessage != null && loadingMessage !== '' && (
            <span style={{ marginLeft: '8px' }}>{loadingMessage}</span>
          )}
        </div>
      )

    case 'block':
    default:
      return (
        <div
          className={`loading-skeleton-block ${className ?? ''}`}
          style={style}
        >
          <Skeleton
            width={width}
            height={height}
            animate={animate}
            className={className}
          />
          {loadingMessage != null && loadingMessage !== '' && (
            <p style={{ marginTop: '12px', color: '#666', fontSize: '14px' }}>
              {loadingMessage}
            </p>
          )}
        </div>
      )
  }
}
