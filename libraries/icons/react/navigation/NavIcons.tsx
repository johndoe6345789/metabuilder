/**
 * Navigation Icons - All navigation icons for sidebar
 * Icons moved from FakeMUI to consolidate in project root /icons/
 */

import React from 'react';
import type { IconProps } from '../fakemui/Icon';

// Re-export IconProps for consumers
export type { IconProps };

// Standard Material Design icons (imported from FakeMUI)
export { Home as HomeIcon } from '../fakemui/Home';
export { Workflow as WorkflowIcon } from '../fakemui/Workflow';
export { Star as StarIcon } from '../fakemui/Star';
export { Settings as SettingsIcon } from '../fakemui/Settings';
export { Notifications as NotificationsIcon } from '../fakemui/Notifications';
export { Help as HelpIcon } from '../fakemui/Help';
export { Delete as DeleteIcon } from '../fakemui/Delete';

// Custom navigation icons
export const RecentIcon: React.FC<IconProps> = ({ width = 20, height = 20, className, ...rest }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor" className={className} {...rest}>
    <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
  </svg>
);

export const TemplatesIcon: React.FC<IconProps> = ({ width = 20, height = 20, className, ...rest }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor" className={className} {...rest}>
    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/>
  </svg>
);

export const PluginsIcon: React.FC<IconProps> = ({ width = 20, height = 20, className, ...rest }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor" className={className} {...rest}>
    <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7s2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"/>
  </svg>
);

export const DocsIcon: React.FC<IconProps> = ({ width = 20, height = 20, className, ...rest }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor" className={className} {...rest}>
    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
  </svg>
);

export const EmptyNotificationIcon: React.FC<IconProps> = ({ width = 48, height = 48, className, ...rest }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor" className={className} {...rest}>
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-1.29 1.29c-.63.63-.19 1.71.7 1.71h13.17c.89 0 1.34-1.08.71-1.71L18 16z"/>
  </svg>
);
