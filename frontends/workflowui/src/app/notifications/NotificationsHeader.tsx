/** NotificationsHeader - Title, unread badge, mark all read */

'use client';

import React from 'react';
import { Button } from '@metabuilder/m3';
import styles from '@scss/atoms/notifications.module.scss';

interface NotificationsHeaderProps {
  unreadCount: number;
  onMarkAllRead: () => void;
}

export default function NotificationsHeader({
  unreadCount,
  onMarkAllRead,
}: NotificationsHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <h1 className={styles.title}>Notifications</h1>
        {unreadCount > 0 && (
          <span className={styles.unreadBadge}>
            {unreadCount} unread
          </span>
        )}
      </div>
      <div className={styles.headerActions}>
        <Button
          variant="text"
          size="small"
          onClick={onMarkAllRead}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </Button>
      </div>
    </div>
  );
}
