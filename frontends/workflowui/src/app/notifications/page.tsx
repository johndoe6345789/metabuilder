/**
 * Notifications Page - Full notification center
 */

'use client';

import React, { useState } from 'react';
import { Button, IconButton, Breadcrumbs, Menu, MenuItem } from '@metabuilder/fakemui';
import { testId } from '../../utils/accessibility';
import styles from '@/../../../scss/atoms/notifications.module.scss';

interface Notification {
  id: string;
  type: 'workflow' | 'plugin' | 'system' | 'alert';
  title: string;
  message: string;
  time: string;
  timeAgo: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  { id: '1', type: 'workflow', title: 'Workflow completed', message: 'My Workflow ran successfully with 5 nodes executed', time: '2024-01-15 10:30', timeAgo: '2 min ago', read: false },
  { id: '2', type: 'plugin', title: 'New plugin available', message: 'Python executor v2.1 is ready to install with performance improvements', time: '2024-01-15 09:30', timeAgo: '1 hour ago', read: false },
  { id: '3', type: 'system', title: 'System update', message: 'WorkflowUI updated to v3.2 - Check out the new features!', time: '2024-01-14 18:00', timeAgo: 'Yesterday', read: true },
  { id: '4', type: 'workflow', title: 'Workflow failed', message: 'Data Import workflow encountered an error at node 3', time: '2024-01-14 15:45', timeAgo: 'Yesterday', read: true },
  { id: '5', type: 'alert', title: 'High CPU usage detected', message: 'Your workflow "Analytics Pipeline" is using 85% CPU', time: '2024-01-14 12:00', timeAgo: '2 days ago', read: true },
  { id: '6', type: 'plugin', title: 'Plugin update', message: 'TypeScript executor updated to v1.5 with bug fixes', time: '2024-01-13 10:00', timeAgo: '3 days ago', read: true },
];

const typeIcons: Record<string, React.ReactNode> = {
  workflow: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3z"/></svg>,
  plugin: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7s2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"/></svg>,
  system: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>,
  alert: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>,
};

const typeColors: Record<string, string> = {
  workflow: 'var(--mat-sys-primary)',
  plugin: 'var(--mat-sys-tertiary)',
  system: 'var(--mat-sys-secondary)',
  alert: 'var(--mat-sys-error)',
};

type FilterType = 'all' | 'unread' | 'workflow' | 'plugin' | 'system' | 'alert';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortMenuAnchor, setSortMenuAnchor] = useState<HTMLElement | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className={styles.container}>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/' },
          { label: 'Notifications' },
        ]}
      />

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Notifications</h1>
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>{unreadCount} unread</span>
          )}
        </div>
        <div className={styles.headerActions}>
          <Button variant="text" size="small" onClick={markAllAsRead} disabled={unreadCount === 0}>
            Mark all as read
          </Button>
        </div>
      </div>

      <div className={styles.filters}>
        {(['all', 'unread', 'workflow', 'plugin', 'system', 'alert'] as FilterType[]).map(f => (
          <Button
            key={f}
            variant={filter === f ? 'tonal' : 'outlined'}
            size="small"
            className={`${styles.filterChip} ${filter === f ? styles.filterChipActive : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'unread' ? 'Unread' : f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'unread' && unreadCount > 0 && <span className={styles.filterCount}>{unreadCount}</span>}
          </Button>
        ))}
      </div>

      <div className={styles.list}>
        {filteredNotifications.length === 0 ? (
          <div className={styles.empty}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="var(--mat-sys-outline)">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-1.29 1.29c-.63.63-.19 1.71.7 1.71h13.17c.89 0 1.34-1.08.71-1.71L18 16z"/>
            </svg>
            <p>No notifications</p>
          </div>
        ) : (
          filteredNotifications.map(n => (
            <div
              key={n.id}
              className={`${styles.item} ${!n.read ? styles.itemUnread : ''}`}
              onClick={() => markAsRead(n.id)}
            >
              <div className={styles.itemIcon} style={{ color: typeColors[n.type] }}>
                {typeIcons[n.type]}
              </div>
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
                onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                aria-label="Delete notification"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </IconButton>
              {!n.read && <span className={styles.unreadDot} />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
