import type { Metadata, Viewport } from 'next'
// Temporarily disabled Google Fonts due to network restrictions in build environment
// import { IBM_Plex_Sans, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/sonner'
import '@/index.css'

// Temporarily disabled until fonts can be loaded properly
/*
const ibmPlexSans = IBM_Plex_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})
*/

export const metadata: Metadata = {
  title: {
    default: 'MetaBuilder - Data-Driven Application Platform',
    template: '%s | MetaBuilder',
  },
  description: 'A data-driven, multi-tenant application platform where 95% of functionality is defined through JSON and Lua.',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
