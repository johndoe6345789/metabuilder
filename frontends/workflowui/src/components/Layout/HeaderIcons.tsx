/**
 * Header Icons - SVG icons used in the app header
 */

import React from 'react';

export const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" />
    <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" />
    <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" />
  </svg>
);

export const LightModeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" />
    <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" />
    <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" />
    <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const DarkModeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export const NotificationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-1.29 1.29c-.63.63-.19 1.71.7 1.71h13.17c.89 0 1.34-1.08.71-1.71L18 16z"/>
  </svg>
);

export const WorkflowLogo = () => (
  <svg width="32" height="32" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" rx="96" fill="var(--mat-sys-primary)"/>
    <circle cx="96" cy="256" r="48" fill="var(--mat-sys-on-primary)" opacity="0.9"/>
    <circle cx="256" cy="96" r="48" fill="var(--mat-sys-on-primary)" opacity="0.7"/>
    <circle cx="256" cy="416" r="48" fill="var(--mat-sys-on-primary)" opacity="0.7"/>
    <circle cx="416" cy="256" r="48" fill="var(--mat-sys-on-primary)" opacity="0.9"/>
    <path d="M144 256h64M304 256h64M256 144v64M256 304v64" stroke="var(--mat-sys-on-primary)" strokeWidth="8" strokeLinecap="round" opacity="0.5"/>
    <circle cx="256" cy="256" r="56" fill="var(--mat-sys-on-primary)"/>
    <path d="M240 232l32 24-32 24V232z" fill="var(--mat-sys-primary)"/>
  </svg>
);
