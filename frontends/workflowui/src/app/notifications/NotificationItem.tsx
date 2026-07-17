/**
 * NotificationItem - Single notification row
 */

'use client';

import React from 'react';
import { IconButton } from '@metabuilder/m3';
import styles from '@scss/atoms/notifications.module.scss';

const TYPE_COLORS: Record<string, string> = {
  workflow: 'var(--mat-sys-primary)',
  plugin: 'var(--mat-sys-tertiary)',
  system: 'var(--mat-sys-secondary)',
  alert: 'var(--mat-sys-error)',
};

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  time: string;
  timeAgo: string;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function NotificationItem({
  notification: n,
  onMarkRead,
  onDelete,
}: NotificationItemProps) {
  return (
    <div
      className={`${styles.item} ${
        !n.read ? styles.itemUnread : ''
      }`}
      onClick={() => onMarkRead(n.id)}
    >
      <div
        className={styles.itemIcon}
        style={{ color: TYPE_COLORS[n.type] }}
      />
      <div className={styles.itemContent}>
        <div className={styles.itemHeader}>
          <span className={styles.itemTitle}>{n.title}</span>
          <span className={styles.itemTime}>{n.timeAgo}</span>
        </div>
        <p className={styles.itemMessage}>{n.message}</p>
        <div className={styles.itemMeta}>
          <span className={styles.itemType}>{n.type}</span>
          <span className={styles.itemDate}>{n.time}</span>
        </div>
      </div>
      <IconButton
        size="small"
        className={styles.itemDelete}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(n.id);
        }}
        aria-label="Delete notification"
      >
        ×
      </IconButton>
      {!n.read && <span className={styles.unreadDot} />}
    </div>
  );
}
