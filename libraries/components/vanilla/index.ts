/**
 * Vanilla React Components
 *
 * Pure React components with no external UI library dependencies.
 * These components use only React and inline styles.
 */

// Loading components
export {
  LoadingIndicator,
  InlineLoader,
  AsyncLoading,
  loadingStyles,
  type LoadingIndicatorProps,
  type InlineLoaderProps,
  type AsyncLoadingProps,
} from './loading'

// Error handling components
export {
  ErrorBoundary,
  withErrorBoundary,
  ErrorDisplay,
  type ErrorBoundaryProps,
  type ErrorReporter,
  type ErrorDisplayProps,
} from './error'

// Empty state components
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
} from './empty-state'

// Skeleton components
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
} from './skeleton'

// Access denied component
export {
  AccessDenied,
  accessDeniedStyles,
  type AccessDeniedProps,
} from './access-denied'

// Notification components
export {
  NotificationContainer,
  NotificationItem,
  useNotificationState,
  notificationStyles,
  type NotificationData,
  type NotificationType,
  type NotificationPosition,
  type NotificationContainerProps,
  type NotificationItemProps,
} from './notifications'

// Status indicator components
export {
  StatusBadge,
  ConnectionStatus,
  BackendStatus,
  statusIndicatorStyles,
  type StatusVariant,
  type BackendStatusType,
  type StatusBadgeProps,
  type ConnectionStatusProps,
  type BackendStatusProps,
} from './status-indicators'
