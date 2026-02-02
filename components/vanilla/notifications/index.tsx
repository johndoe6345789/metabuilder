/**
 * Notification Components
 * Generic notification system - framework agnostic (no Redux dependency)
 *
 * Usage:
 * ```tsx
 * // Basic usage with local state
 * const [notifications, setNotifications] = useState<NotificationData[]>([])
 *
 * <NotificationContainer
 *   notifications={notifications}
 *   onClose={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
 * />
 *
 * // With position
 * <NotificationContainer
 *   notifications={notifications}
 *   onClose={handleClose}
 *   position="top-right"
 * />
 * ```
 */

import React, { useEffect, useCallback } from 'react'

// =============================================================================
// TYPES
// =============================================================================

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export type NotificationPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export interface NotificationData {
  id: string
  type: NotificationType
  message: string
  title?: string
  duration?: number // ms, 0 = no auto-dismiss
}

export interface NotificationContainerProps {
  /** Array of notifications to display */
  notifications: NotificationData[]
  /** Called when a notification should be removed */
  onClose: (id: string) => void
  /** Position on screen */
  position?: NotificationPosition
  /** Maximum notifications to show at once */
  maxVisible?: number
  /** Custom className for container */
  className?: string
}

export interface NotificationItemProps {
  notification: NotificationData
  onClose: () => void
}

// =============================================================================
// STYLES
// =============================================================================

const typeStyles: Record<NotificationType, { bg: string; border: string; text: string }> = {
  success: {
    bg: 'rgba(46, 125, 50, 0.1)',
    border: 'var(--color-success, #2e7d32)',
    text: 'var(--color-success, #2e7d32)',
  },
  error: {
    bg: 'rgba(211, 47, 47, 0.1)',
    border: 'var(--color-error, #d32f2f)',
    text: 'var(--color-error, #d32f2f)',
  },
  warning: {
    bg: 'rgba(245, 127, 0, 0.1)',
    border: 'var(--color-warning, #f57f00)',
    text: 'var(--color-warning, #f57f00)',
  },
  info: {
    bg: 'rgba(2, 136, 209, 0.1)',
    border: 'var(--color-info, #0288d1)',
    text: 'var(--color-info, #0288d1)',
  },
}

const positionStyles: Record<NotificationPosition, React.CSSProperties> = {
  'top-left': { top: 16, left: 16 },
  'top-center': { top: 16, left: '50%', transform: 'translateX(-50%)' },
  'top-right': { top: 16, right: 16 },
  'bottom-left': { bottom: 16, left: 16 },
  'bottom-center': { bottom: 16, left: '50%', transform: 'translateX(-50%)' },
  'bottom-right': { bottom: 16, right: 16 },
}

// =============================================================================
// ICONS
// =============================================================================

const SuccessIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ErrorIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)

const WarningIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const typeIcons: Record<NotificationType, React.FC> = {
  success: SuccessIcon,
  error: ErrorIcon,
  warning: WarningIcon,
  info: InfoIcon,
}

// =============================================================================
// COMPONENTS
// =============================================================================

/**
 * Individual notification item
 */
export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose }) => {
  const { type, message, title, duration } = notification
  const styles = typeStyles[type]
  const Icon = typeIcons[type]

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  return (
    <div
      role="alert"
      data-testid={`notification-${notification.id}`}
      data-notification-type={type}
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        backgroundColor: styles.bg,
        borderLeft: `4px solid ${styles.border}`,
        color: styles.text,
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        minWidth: '280px',
        maxWidth: '400px',
        animation: 'notification-slide-in 0.3s ease-out',
      }}
    >
      <div style={{ flexShrink: 0, marginTop: 2 }}>
        <Icon />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <p style={{ fontWeight: 600, marginBottom: 4, fontSize: '14px' }}>{title}</p>
        )}
        <p style={{ fontSize: '14px', lineHeight: 1.5 }}>{message}</p>
      </div>
      <button
        onClick={onClose}
        aria-label="Close notification"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          color: 'inherit',
          opacity: 0.7,
          flexShrink: 0,
        }}
      >
        <CloseIcon />
      </button>
    </div>
  )
}

/**
 * Container for notifications - renders all active notifications
 */
export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onClose,
  position = 'top-right',
  maxVisible = 5,
  className,
}) => {
  const handleClose = useCallback(
    (id: string) => {
      onClose(id)
    },
    [onClose]
  )

  const visibleNotifications = notifications.slice(0, maxVisible)

  if (visibleNotifications.length === 0) {
    return null
  }

  return (
    <div
      role="region"
      aria-live="polite"
      aria-atomic="false"
      aria-label="Notifications"
      data-testid="notification-container"
      className={className}
      style={{
        position: 'fixed',
        zIndex: 9999,
        display: 'flex',
        flexDirection: position.startsWith('bottom') ? 'column-reverse' : 'column',
        gap: '8px',
        pointerEvents: 'none',
        ...positionStyles[position],
      }}
    >
      {visibleNotifications.map((notification) => (
        <div key={notification.id} style={{ pointerEvents: 'auto' }}>
          <NotificationItem
            notification={notification}
            onClose={() => handleClose(notification.id)}
          />
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// STYLES (CSS-in-JS keyframes)
// =============================================================================

export const notificationStyles = `
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

@media (prefers-reduced-motion: reduce) {
  [data-testid^="notification-"] {
    animation: none;
  }
}
`

// =============================================================================
// HOOK FOR NOTIFICATION STATE MANAGEMENT
// =============================================================================

/**
 * Hook for managing notification state (optional - can use Redux instead)
 *
 * @example
 * const { notifications, addNotification, removeNotification, clearAll } = useNotificationState()
 *
 * // Add a notification
 * addNotification({ type: 'success', message: 'Saved!', duration: 3000 })
 *
 * // Render
 * <NotificationContainer notifications={notifications} onClose={removeNotification} />
 */
export function useNotificationState(initialNotifications: NotificationData[] = []) {
  const [notifications, setNotifications] = React.useState<NotificationData[]>(initialNotifications)

  const addNotification = useCallback((notification: Omit<NotificationData, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    setNotifications((prev) => [...prev, { ...notification, id }])
    return id
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  }
}

export default NotificationContainer
