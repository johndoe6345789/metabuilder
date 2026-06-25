'use client'

import React, { useEffect, useCallback } from 'react'
import { classNames } from '../utils/classNames'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'
export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'

export interface NotificationData {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

export interface NotificationContainerProps {
  notifications: NotificationData[]
  onClose: (id: string) => void
  position?: NotificationPosition
  maxVisible?: number
  className?: string
  testId?: string
}

const ICONS: Record<NotificationType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}

interface NotificationItemProps {
  notification: NotificationData
  onClose: (id: string) => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose }) => {
  const { id, type, message, duration = 5000 } = notification

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose(id), duration)
      return () => clearTimeout(timer)
    }
  }, [id, duration, onClose])

  const rootClass = classNames(
    'm3-notification',
    `m3-notification--${type}`
  )

  return (
    <div className={rootClass} role="alert" aria-live="polite">
      <span className="m3-notification__icon">{ICONS[type]}</span>
      <span className="m3-notification__message">{message}</span>
      <button
        className="m3-notification__close"
        onClick={() => onClose(id)}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  )
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onClose,
  position = 'top-right',
  maxVisible = 5,
  className = '',
  testId,
}) => {
  const handleClose = useCallback((id: string) => {
    onClose(id)
  }, [onClose])

  const visibleNotifications = notifications.slice(0, maxVisible)

  if (visibleNotifications.length === 0) return null

  const rootClass = classNames(
    'm3-notification-container',
    `m3-notification-container--${position}`,
    className
  )

  return (
    <div className={rootClass} data-testid={testId} role="region" aria-label="Notifications" aria-live="polite">
      {visibleNotifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={handleClose}
        />
      ))}
    </div>
  )
}

export default NotificationContainer
