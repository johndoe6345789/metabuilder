import '@/main.scss'

import type { Metadata, Viewport } from 'next'

import { Providers } from './providers'

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
    { media: '(prefers-color-scheme: light)', color: 'oklch(0.92 0.03 290)' },
    { media: '(prefers-color-scheme: dark)', color: 'oklch(0.18 0.02 270)' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
