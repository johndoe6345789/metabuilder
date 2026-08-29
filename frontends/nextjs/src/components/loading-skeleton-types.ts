/** What a LoadingSkeleton can be asked to look like. */

import type React from 'react'

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
