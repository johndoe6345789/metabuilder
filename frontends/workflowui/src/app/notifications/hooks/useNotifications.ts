/**
 * useNotifications - Notifications page state
 */

'use client';

import { useState } from 'react';
import mockNotifications from '../notifications.json';

export type FilterType =
  | 'all'
  | 'unread'
  | 'workflow'
  | 'plugin'
  | 'system'
  | 'alert';

export type Notification = (typeof mockNotifications)[0];

export function useNotifications() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<FilterType>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return {
    filteredNotifications,
    filter,
    setFilter,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
