// Shim for @metabuilder/components — provides stub implementations
// for components that are unavailable in the standalone Docker build

const noop = () => null
const noopStyles: Record<string, string> = {}

// Skeletons
export const Skeleton = noop
export const TableSkeleton = noop
export const CardSkeleton = noop
export const ListSkeleton = noop
export const FormSkeleton = noop
export const AvatarSkeleton = noop
export const TextSkeleton = noop
export const skeletonStyles = noopStyles
export type SkeletonProps = Record<string, unknown>
export type TableSkeletonProps = Record<string, unknown>
export type CardSkeletonProps = Record<string, unknown>
export type ListSkeletonProps = Record<string, unknown>
export type FormSkeletonProps = Record<string, unknown>
export type AvatarSkeletonProps = Record<string, unknown>
export type TextSkeletonProps = Record<string, unknown>

// Loading Indicators
export const LoadingIndicator = noop
export const InlineLoader = noop
export const AsyncLoading = noop
export const loadingStyles = noopStyles
export type LoadingIndicatorProps = Record<string, unknown>
export type InlineLoaderProps = Record<string, unknown>
export type AsyncLoadingProps = Record<string, unknown>

// Empty States
export const EmptyState = noop
export const NoDataFound = noop
export const NoResultsFound = noop
export const NoItemsYet = noop
export const AccessDeniedState = noop
export const ErrorState = noop
export const NoConnectionState = noop
export const LoadingCompleteState = noop
export const emptyStateStyles = noopStyles
export type EmptyStateProps = Record<string, unknown>

// Error Boundary
export const ErrorBoundary = noop
export const withErrorBoundary = (c: any) => c
export const ErrorDisplay = noop
export type ErrorBoundaryProps = Record<string, unknown>
export type ErrorReporter = Record<string, unknown>
export type ErrorDisplayProps = Record<string, unknown>

// Access Control
export const AccessDenied = noop
export const accessDeniedStyles = noopStyles
export type AccessDeniedProps = Record<string, unknown>
