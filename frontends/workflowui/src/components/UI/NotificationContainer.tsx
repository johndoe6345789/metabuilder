/**
 * @deprecated This component is deprecated in favor of the shared NotificationContainer
 * from @metabuilder/components. Use NotificationAdapter instead, which bridges
 * the Redux state to the shared component.
 *
 * Migration guide:
 * - Replace imports of NotificationContainer with NotificationAdapter
 * - The adapter automatically connects to useUI() hook
 *
 * @see /src/components/UI/NotificationAdapter.tsx
 * @see @metabuilder/components NotificationContainer
 */

import React from 'react';
import { useUI } from '../../hooks';
import Notification from './Notification';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useUI();

  return (
    <div
      role="region"
      aria-live="polite"
      aria-atomic="true"
    >
      {notifications.map((notification: any) => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={() =>
            removeNotification(notification.id)
          }
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
