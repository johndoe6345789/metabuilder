/**
 * Root Layout
 * Provider and global setup for entire application
 */

import type { Metadata, Viewport } from 'next';
import React from 'react';
import RootLayoutClient from '../components/Layout/RootLayoutClient';
// All styles from shared scss folder
import '../../../../scss/index.scss';

export const metadata: Metadata = {
  title: 'WorkflowUI - Visual Workflow Editor',
  description: 'Build, execute, and manage workflows with an intuitive visual editor',
  applicationName: 'WorkflowUI',
  keywords: ['workflow', 'automation', 'editor', 'visual', 'pipeline', 'n8n'],
  authors: [{ name: 'MetaBuilder' }],
  icons: {
    icon: [
      { url: '/workflowui/icons/workflow-logo.svg', type: 'image/svg+xml' },
      { url: '/workflowui/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/workflowui/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/workflowui/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/workflowui/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  manifest: '/workflowui/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WorkflowUI',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
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
