/** NotificationsFilterBar - Filter chip buttons */

'use client';

import React from 'react';
import { Button } from '@metabuilder/m3';
import styles from '@scss/atoms/notifications.module.scss';
import type { FilterType } from './hooks/useNotifications';

const FILTERS: FilterType[] = [
  'all', 'unread', 'workflow', 'plugin', 'system', 'alert',
];

function filterLabel(f: FilterType): string {
  if (f === 'all') return 'All';
  if (f === 'unread') return 'Unread';
  return f.charAt(0).toUpperCase() + f.slice(1);
}

interface NotificationsFilterBarProps {
  filter: FilterType;
  unreadCount: number;
  onSetFilter: (f: FilterType) => void;
}

export default function NotificationsFilterBar({
  filter,
  unreadCount,
  onSetFilter,
}: NotificationsFilterBarProps) {
  return (
    <div className={styles.filters}>
      {FILTERS.map((f) => (
        <Button
          key={f}
          variant={filter === f ? 'tonal' : 'outlined'}
          size="small"
          className={`${styles.filterChip} ${
            filter === f ? styles.filterChipActive : ''
          }`}
          onClick={() => onSetFilter(f)}
        >
          {filterLabel(f)}
          {f === 'unread' && unreadCount > 0 && (
            <span className={styles.filterCount}>
              {unreadCount}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
}
