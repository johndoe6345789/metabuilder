/**
 * NotificationMenu Component - Notification bell with dropdown
 */

'use client';

import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Divider } from '@metabuilder/fakemui';
import { testId } from '../../utils/accessibility';
import { NotificationIcon } from './HeaderIcons';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  { id: '1', title: 'Workflow completed', message: 'My Workflow ran successfully', time: '2 min ago', read: false },
  { id: '2', title: 'New plugin available', message: 'Python executor v2.1 is ready', time: '1 hour ago', read: false },
  { id: '3', title: 'System update', message: 'WorkflowUI updated to v3.2', time: 'Yesterday', read: true },
];

export const NotificationMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [notifications] = useState<Notification[]>(mockNotifications);
  const open = Boolean(anchorEl);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ position: 'relative' }}>
      <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)} aria-label="Notifications" data-testid={testId.button('notifications')}>
        <NotificationIcon />
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16, borderRadius: 8,
            background: 'var(--mat-sys-error)', border: '2px solid var(--mat-sys-surface)',
            color: 'var(--mat-sys-on-error)', fontSize: 10, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount}</span>
        )}
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)} anchorRight style={{ minWidth: 340, maxWidth: 400 }}>
        <div style={{ padding: '14px 16px', fontWeight: 600, fontSize: '0.9rem',
          borderBottom: '1px solid var(--mat-sys-outline-variant)', display: 'flex', alignItems: 'center', gap: 8 }}>
          Notifications
          {unreadCount > 0 && (
            <span style={{ background: 'var(--mat-sys-primary)', color: 'var(--mat-sys-on-primary)',
              fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10 }}>{unreadCount} new</span>
          )}
        </div>

        {notifications.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--mat-sys-on-surface-variant)' }}>
            No notifications
          </div>
        ) : (
          notifications.map((n, i) => (
            <React.Fragment key={n.id}>
              <MenuItem onClick={() => setAnchorEl(null)} style={{ padding: '12px 16px', opacity: n.read ? 0.65 : 1 }}>
                <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                  {!n.read && <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--mat-sys-primary)', marginTop: 6, flexShrink: 0 }} />}
                  <div style={{ flex: 1, marginLeft: n.read ? 20 : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{n.title}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--mat-sys-outline)', whiteSpace: 'nowrap' }}>{n.time}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--mat-sys-on-surface-variant)', marginTop: 2 }}>{n.message}</div>
                  </div>
                </div>
              </MenuItem>
              {i < notifications.length - 1 && <Divider style={{ margin: 0 }} />}
            </React.Fragment>
          ))
        )}

        <Divider />
        <MenuItem onClick={() => setAnchorEl(null)} style={{ justifyContent: 'center', padding: '12px 16px',
          color: 'var(--mat-sys-primary)', fontWeight: 500, fontSize: '0.875rem' }}>
          View all notifications
        </MenuItem>
      </Menu>
    </div>
  );
};
