'use client'

import { type ReactNode } from 'react'

export interface LoadingContentProps {
  /** Loading message */
  message?: string
  /** Custom icon */
  icon?: ReactNode
  /** Number of skeleton lines to show */
  skeletonLines?: number
  /** Custom className */
  className?: string
  /** Disable animations */
  disableAnimations?: boolean
  /** Test ID for testing */
  testId?: string
}

/**
 * Loading content component with animated skeletons.
 *
 * @example
 * ```tsx
 * <LoadingContent
 *   message="Loading data..."
 *   skeletonLines={3}
 * />
 * ```
 */
export function LoadingContent({
  message = 'Loading...',
  icon,
  skeletonLines = 3,
  className = '',
  disableAnimations = false,
  testId,
}: LoadingContentProps) {
  return (
    <div
      className={`space-y-3 ${className}`}
      data-testid={testId ?? "loading-content"}
      role="status"
      aria-busy="true"
      aria-label={message}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon || <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" aria-hidden="true" />}
        <span className="text-sm">{message}</span>
      </div>
      <div className="space-y-2">
        {Array.from({ length: skeletonLines }).map((_, i) => (
          <div
            key={i}
            className={`h-4 bg-muted rounded ${disableAnimations ? '' : 'animate-pulse'}`}
            style={disableAnimations ? {} : { animationDelay: `${i * 200}ms` }}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  )
}
