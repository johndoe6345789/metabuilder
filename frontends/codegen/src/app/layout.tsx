import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import React from 'react';

import Providers from './providers';
import '@/main.scss';
import '@/styles/theme.scss';
import '@/index.scss';

export const metadata: Metadata = {
  title: 'CodeForge - Low-Code Development Platform',
  description: 'Comprehensive low-code platform for rapid application development',
  icons: {
    icon: [{ url: '/codegen/favicon.svg', type: 'image/svg+xml' }],
  },
  manifest: '/codegen/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#8b5cf6',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        <Script src="/codegen/runtime-config.js" strategy="beforeInteractive" />
      </head>
      <body>
        <Providers>
          <div id="root">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
