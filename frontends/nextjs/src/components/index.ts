/**
 * Component Export Index
 *
 * Centralized exports for all reusable components.
 * Base components are imported from @metabuilder/components,
 * project-specific components are defined locally.
 */

// =============================================================================
// RE-EXPORTS FROM @metabuilder/components (shared across projects)
// =============================================================================

// Loading & Skeletons
export {
  Skeleton,
  TableSkeleton,
  CardSkeleton,
  ListSkeleton,
  FormSkeleton,
  AvatarSkeleton,
  TextSkeleton,
  skeletonStyles,
  type SkeletonProps,
  type TableSkeletonProps,
  type CardSkeletonProps,
  type ListSkeletonProps,
  type FormSkeletonProps,
  type AvatarSkeletonProps,
  type TextSkeletonProps,
} from '@metabuilder/components'

// Loading Indicators
export {
  LoadingIndicator,
  InlineLoader,
  AsyncLoading,
  loadingStyles,
  type LoadingIndicatorProps,
  type InlineLoaderProps,
  type AsyncLoadingProps,
} from '@metabuilder/components'

// Empty States
export {
  EmptyState,
  NoDataFound,
  NoResultsFound,
  NoItemsYet,
  AccessDeniedState,
  ErrorState,
  NoConnectionState,
  LoadingCompleteState,
  emptyStateStyles,
  type EmptyStateProps,
} from '@metabuilder/components'

// Error Boundary
export {
  ErrorBoundary,
  withErrorBoundary,
  ErrorDisplay,
  type ErrorBoundaryProps,
  type ErrorReporter,
  type ErrorDisplayProps,
} from '@metabuilder/components'

// Access Control
export {
  AccessDenied,
  accessDeniedStyles,
  type AccessDeniedProps,
} from '@metabuilder/components'

// =============================================================================
// PROJECT-SPECIFIC COMPONENTS (Next.js app specific)
// =============================================================================

// Loading Skeleton (unified wrapper - uses local Skeleton import)
export {
  LoadingSkeleton,
  TableLoading,
  CardLoading,
  ListLoading,
  InlineLoading,
  FormLoading,
} from './LoadingSkeleton'
export type { LoadingSkeletonProps, FormLoadingProps, TableLoadingProps } from './LoadingSkeleton'

// Empty State Showcase (demo component)
export { EmptyStateShowcase } from './EmptyStateShowcase'

// Component Rendering (depends on @/lib/packages/json)
export { JSONComponentRenderer } from './JSONComponentRenderer'

// UI Page Renderer (depends on @/lib/packages/json)
export { UIPageRenderer, useAction, useUIPageActions } from './ui-page-renderer'

// Pagination (uses FakeMUI components)
export {
  PaginationControls,
  PaginationInfo,
  ItemsPerPageSelector,
} from './pagination'
export type { PaginationControlsProps } from './pagination/PaginationControls'
export type { PaginationInfoProps } from './pagination/PaginationInfo'
export type { ItemsPerPageSelectorProps } from './pagination/ItemsPerPageSelector'

// Icon utilities (depends on @/fakemui/icons)
export { getComponentIcon } from './get-component-icon'

// Package Style Loader (depends on @/lib/compiler)
export { PackageStyleLoader } from './PackageStyleLoader'

// Retryable Error Boundary (depends on @/lib/error-reporting)
export { RetryableErrorBoundary, withRetryableErrorBoundary } from './RetryableErrorBoundary'
export type { RetryableErrorBoundaryProps } from './RetryableErrorBoundary'
