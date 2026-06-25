/**
 * NotificationIcon - SVG icon for notification types
 */

import React from 'react';

interface NotificationIconProps {
  type: 'success' | 'error' | 'warning' | 'info';
}

export default function NotificationIcon({
  type,
}: NotificationIconProps) {
  if (type === 'success') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24"
        fill="none" stroke="currentColor">
        <polyline points="20 6 9 17 4 12" strokeWidth="2" />
      </svg>
    );
  }
  if (type === 'error') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24"
        fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" />
        <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" />
      </svg>
    );
  }
  if (type === 'warning') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24"
        fill="none" stroke="currentColor">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05l-8.47-14.14a2 2 0 0 0-3.41 0z" />
        <line x1="12" y1="9" x2="12" y2="13" strokeWidth="2" />
        <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <line x1="12" y1="16" x2="12" y2="12" strokeWidth="2" />
      <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2" />
    </svg>
  );
}
