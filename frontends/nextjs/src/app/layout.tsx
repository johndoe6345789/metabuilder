import '@/main.scss'

import type { Metadata, Viewport } from 'next'

import { PackageStyleLoader } from '@/components/PackageStyleLoader'
import { Providers } from './providers'
import { loadPackage } from '@/lib/packages/unified'

// List of packages to load styles from
const PACKAGES_WITH_STYLES = [
  'shared',
  'ui_home',
  'ui_header',
  'ui_footer',
  'ui_level2',
  'ui_level3',
  'ui_level4',
  'ui_level5',
  'ui_level6',
  'admin_panel',
  'code_editor',
  'css_designer',
]

export const metadata: Metadata = {
  title: {
    default: 'MetaBuilder - Data-Driven Application Platform',
    template: '%s | MetaBuilder',
  },
  description:
    'A data-driven, multi-tenant application platform where 95% of functionality is defined through JSON and Lua.',
  keywords: ['metabuilder', 'low-code', 'no-code', 'lua', 'platform', 'multi-tenant'],
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
  // Load header/footer packages using unified loader
  const headerPkg = await loadPackage('ui_header')
  const footerPkg = await loadPackage('ui_footer')

  const headerName = headerPkg?.name
  const footerName = footerPkg?.name

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
        <PackageStyleLoader packages={PACKAGES_WITH_STYLES} />

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
