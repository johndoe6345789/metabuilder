/** Notifications Page - Full notification center */

'use client';

import React from 'react';
import { Breadcrumbs } from '@metabuilder/fakemui';
import styles from '@/../../../scss/atoms/notifications.module.scss';
import { useNotifications } from './hooks/useNotifications';
import NotificationItem from './NotificationItem';
import NotificationsHeader from './NotificationsHeader';
import NotificationsFilterBar from './NotificationsFilterBar';

export default function NotificationsPage() {
  const {
    filteredNotifications,
    filter,
    setFilter,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  return (
    <div className={styles.container}>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/' },
          { label: 'Notifications' },
        ]}
      />
      <NotificationsHeader
        unreadCount={unreadCount}
        onMarkAllRead={markAllAsRead}
      />
      <NotificationsFilterBar
        filter={filter}
        unreadCount={unreadCount}
        onSetFilter={setFilter}
      />
      <div className={styles.list}>
        {filteredNotifications.length === 0 ? (
          <div className={styles.empty}>
            <p>No notifications</p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))
        )}
      </div>
    </div>
  );
}
