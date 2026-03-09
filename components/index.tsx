/**
 * @metabuilder/components
 *
 * Shared React components for MetaBuilder projects.
 * Organized by UI library dependency:
 *
 * - vanilla/  - Pure React components (no external UI library)
 * - radix/    - Radix UI based components (shadcn style)
 * - fakemui/  - FakeMUI based components (Material Design 3)
 */

// =============================================================================
// VANILLA COMPONENTS (Pure React, no external UI library)
// =============================================================================

// Loading components
export {
  LoadingIndicator,
  InlineLoader,
  AsyncLoading,
  loadingStyles,
  type LoadingIndicatorProps,
  type InlineLoaderProps,
  type AsyncLoadingProps,
} from './vanilla/loading'

// Error handling components
export {
  ErrorBoundary,
  withErrorBoundary,
  ErrorDisplay,
  type ErrorBoundaryProps,
  type ErrorReporter,
  type ErrorDisplayProps,
} from './vanilla/error'

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
} from './vanilla/empty-state'

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
} from './vanilla/skeleton'

// Access denied component
export {
  AccessDenied,
  accessDeniedStyles,
  type AccessDeniedProps,
} from './vanilla/access-denied'

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
} from './vanilla/notifications'

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
} from './vanilla/status-indicators'

// =============================================================================
// RADIX COMPONENTS (Built on @radix-ui primitives)
// =============================================================================

// Dialog components
export {
  KeyboardShortcutsContent,
  ShortcutRow,
  getPlatformModifier,
  createShortcut,
  type ShortcutItem,
  type ShortcutCategory,
  type KeyboardShortcutsDialogProps,
} from './radix/dialogs/KeyboardShortcutsDialog'

// =============================================================================
// FAKEMUI COMPONENTS (Built on @metabuilder/fakemui)
// =============================================================================

// Re-export all FakeMUI components
// Components are available via:
//   import { Button, Card } from '@metabuilder/components/fakemui'
// Or via the main barrel export (with potential naming conflicts):
//   import { Button } from '@metabuilder/components'
export * from './fakemui'

// Feedback components
export { PasswordStrengthIndicator, type PasswordStrengthIndicatorProps } from './feedback'
export { NotFoundState, type NotFoundStateProps } from './feedback'

// Layout components
export { AuthFormLayout, type AuthFormLayoutProps } from './layout'

// Navigation components
export { HeaderActions, type HeaderActionsProps } from './navigation'

// =============================================================================
// COMBINED STYLES
// =============================================================================

/**
 * Combined styles for all components
 * Inject these into your global CSS or use a style tag
 *
 * @example
 * // In your app's entry point:
 * import { allStyles } from '@metabuilder/components'
 *
 * // Option 1: Inject via style tag
 * const styleTag = document.createElement('style')
 * styleTag.textContent = allStyles
 * document.head.appendChild(styleTag)
 *
 * // Option 2: Import from a CSS file that includes these styles
 */
export const allStyles = `
/* Loading animations */
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes pulse-animation {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
@keyframes progress-animation {
  0% { width: 0%; }
  50% { width: 70%; }
  100% { width: 100%; }
}
@keyframes dots-animation {
  0%, 80%, 100% { opacity: 0; transform: scale(0); }
  40% { opacity: 1; transform: scale(1); }
}

/* Empty state animations */
.empty-state-animated {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Skeleton animations */
@keyframes skeleton-pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
.skeleton-animate {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

/* Notification animations */
@keyframes notification-slide-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Status indicator animations */
@keyframes status-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
@keyframes status-spin {
  to { transform: rotate(360deg); }
}

/* Accessibility: respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .empty-state-animated,
  .skeleton-animate,
  .loading-spinner,
  [data-testid^="notification-"],
  [data-testid="status-badge"] span {
    animation: none;
  }
}
`
