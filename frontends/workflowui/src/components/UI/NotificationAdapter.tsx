/**
 * Notification Adapter Component
 * Bridges the useUI() Redux hook to the shared NotificationContainer component
 *
 * This adapter connects workflowui's Redux-based notification state
 * to the framework-agnostic NotificationContainer from @metabuilder/components
 */

'use client';

import React from 'react';
import {
  NotificationContainer,
  type NotificationData,
  type NotificationPosition,
} from '@metabuilder/fakemui';
import { useUINotifications } from '@metabuilder/hooks';

export interface NotificationAdapterProps {
  /** Position on screen - defaults to top-right */
  position?: NotificationPosition;
  /** Maximum notifications to show at once */
  maxVisible?: number;
  /** Custom className for container */
  className?: string;
}

/**
 * Notification adapter that connects Redux state to the shared component
 *
 * @example
 * // In your layout:
 * <NotificationAdapter position="top-right" maxVisible={5} />
 */
export const NotificationAdapter: React.FC<NotificationAdapterProps> = ({
  position = 'top-right',
  maxVisible = 5,
  className,
}) => {
  const { notifications, removeNotification } = useUINotifications();

  // Map workflowui Notification type to shared NotificationData type
  // Both types are compatible - id, type, message, duration
  const mappedNotifications: NotificationData[] = notifications.map((n) => ({
    id: n.id,
    type: n.type,
    message: n.message,
    duration: n.duration,
  }));

  return (
    <NotificationContainer
      notifications={mappedNotifications}
      onClose={removeNotification}
      position={position}
      maxVisible={maxVisible}
      className={className}
    />
  );
};

export default NotificationAdapter;
