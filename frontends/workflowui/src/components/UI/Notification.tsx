/**
 * Notification - Single auto-dismissing notification item
 */

import React, { useEffect } from 'react';
import NotificationIcon from './NotificationIcon';

const TYPE_BG: Record<string, string> = {
  success: 'rgba(46, 125, 50, 0.1)',
  error: 'rgba(211, 47, 47, 0.1)',
  warning: 'rgba(245, 127, 0, 0.1)',
  info: 'rgba(2, 136, 209, 0.1)',
};

const TYPE_COLOR: Record<string, string> = {
  success: 'var(--color-success)',
  error: 'var(--color-error)',
  warning: 'var(--color-warning)',
  info: 'var(--color-info)',
};

export interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface NotificationProps {
  notification: NotificationItem;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  notification,
  onClose,
}) => {
  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(onClose, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration, onClose]);

  const bg = TYPE_BG[notification.type] || TYPE_BG.info;
  const color =
    TYPE_COLOR[notification.type] || TYPE_COLOR.info;

  return (
    <div
      data-notification-type={notification.type}
      style={{
        padding: '16px',
        borderRadius: '4px',
        backgroundColor: bg,
        borderLeft: '4px solid',
        borderLeftColor: color,
        color,
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
      }}
    >
      <div>
        <NotificationIcon type={notification.type} />
      </div>
      <div>
        <p>{notification.message}</p>
      </div>
      <button
        onClick={onClose}
        aria-label="Close notification"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <line
            x1="18" y1="6" x2="6" y2="18"
            strokeWidth="2"
          />
          <line
            x1="6" y1="6" x2="18" y2="18"
            strokeWidth="2"
          />
        </svg>
      </button>
    </div>
  );
};

export default Notification;
