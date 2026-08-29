'use client'

/** What a LoadingSkeleton shows instead of a skeleton when it has an
 * error to report. */

import type { CSSProperties, ReactNode } from 'react'

export function LoadingSkeletonError({
  error,
  errorComponent,
  className,
  style,
}: {
  error: string | Error
  errorComponent?: ReactNode
  className?: string | undefined
  style?: CSSProperties | undefined
}) {
  return (
      errorComponent ?? (
        <div
          className={`loading-skeleton-error ${className ?? ''}`}
          style={{
            padding: '16px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '16px',
            color: '#991b1b',
            ...style,
          }}
        >
          <strong>Error:</strong>{' '}
          {typeof error === 'string' ? error : error.message}
        </div>
      )
    )
}
