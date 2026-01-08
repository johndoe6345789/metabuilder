import '@/main.scss'

import type { Metadata, Viewport } from 'next'

import { Providers } from './providers'
import { loadPackage } from '@/lib/packages/unified'

export const metadata: Metadata = {
  title: {
    default: 'MetaBuilder - Data-Driven Application Platform',
    template: '%s | MetaBuilder',
  },
  description:
    'A data-driven, multi-tenant platform where every experience is powered by JSON packages.',
  keywords: ['metabuilder', 'low-code', 'no-code', 'platform', 'multi-tenant'],
  authors: [{ name: 'MetaBuilder Team' }],
  creator: 'MetaBuilder',
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Load header/footer packages using unified loader with error handling
  let headerName: string | undefined
  let footerName: string | undefined
  
  try {
    const [headerPkg, footerPkg] = await Promise.all([
      loadPackage('ui_header').catch(() => null),
      loadPackage('ui_footer').catch(() => null),
    ])
    headerName = headerPkg?.name
    footerName = footerPkg?.name
  } catch {
    // Silently handle package loading failures - layout still renders
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* TODO: Fix PackageStyleLoader to work with server-only compiler or create API route */}
        {/* <PackageStyleLoader packages={PACKAGES_WITH_STYLES} /> */}

        {/* Render a simple header/footer when package metadata is available */}
        {headerName !== undefined && headerName.length > 0 ? (
          <header className="app-header">{headerName}</header>
        ) : null}

        <Providers>
          {children}
        </Providers>

        {footerName !== undefined && footerName.length > 0 ? (
          <footer className="app-footer">{footerName}</footer>
        ) : null}
      </body>
    </html>
  )
}
