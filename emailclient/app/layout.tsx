import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Providers } from './providers'

import './globals.css'

export const metadata: Metadata = {
  title: 'Email Client',
  description: 'Full-featured email client with IMAP/SMTP support',
  viewport: 'width=device-width, initial-scale=1.0'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      </head>
      <body>
        <Providers>
          <div id="app-root">{children}</div>
        </Providers>
      </body>
    </html>
  )
}
