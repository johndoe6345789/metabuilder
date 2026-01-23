/**
 * Root Layout
 * Provider and global setup for entire application
 */

import type { Metadata } from 'next';
import React from 'react';
import RootLayoutClient from '../components/Layout/RootLayoutClient';

export const metadata: Metadata = {
  title: 'WorkflowUI - Visual Workflow Editor',
  description: 'Build, execute, and manage workflows with an intuitive visual editor',
  icons: {
    icon: '/favicon.ico'
  },
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false
  }
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
