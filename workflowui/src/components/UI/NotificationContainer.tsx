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

import React, { useEffect } from 'react';
import { useUI } from '../../hooks';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useUI();

  return (
    <div  role="region" aria-live="polite" aria-atomic="true">
      {notifications.map((notification: any) => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

interface NotificationProps {
  notification: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  };
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(onClose, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration, onClose]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12" strokeWidth="2" />
          </svg>
        );
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" />
            <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" />
          </svg>
        );
      case 'warning':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05l-8.47-14.14a2 2 0 0 0-3.41 0z" />
            <line x1="12" y1="9" x2="12" y2="13" strokeWidth="2" />
            <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <line x1="12" y1="16" x2="12" y2="12" strokeWidth="2" />
            <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2" />
          </svg>
        );
    }
  };

  return (
    <div
      data-notification-type={notification.type}
      style={{
        padding: '16px',
        borderRadius: '4px',
        backgroundColor:
          notification.type === 'success' ? 'rgba(46, 125, 50, 0.1)' :
          notification.type === 'error' ? 'rgba(211, 47, 47, 0.1)' :
          notification.type === 'warning' ? 'rgba(245, 127, 0, 0.1)' :
          'rgba(2, 136, 209, 0.1)',
        borderLeft: '4px solid',
        borderLeftColor:
          notification.type === 'success' ? 'var(--color-success)' :
          notification.type === 'error' ? 'var(--color-error)' :
          notification.type === 'warning' ? 'var(--color-warning)' :
          'var(--color-info)',
        color:
          notification.type === 'success' ? 'var(--color-success)' :
          notification.type === 'error' ? 'var(--color-error)' :
          notification.type === 'warning' ? 'var(--color-warning)' :
          'var(--color-info)',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
      }}
    >
      <div >{getIcon(notification.type)}</div>
      <div >
        <p >{notification.message}</p>
      </div>
      <button
        
        onClick={onClose}
        aria-label="Close notification"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
          <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
        </svg>
      </button>
    </div>
  );
};

export default NotificationContainer;
