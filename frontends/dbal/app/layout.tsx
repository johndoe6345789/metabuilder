import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { IBM_Plex_Sans, Space_Grotesk } from 'next/font/google'
import { NavTabs } from '@/NavTabs'
import './globals.css'

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-body',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
})

export const metadata: Metadata = {
  title: 'DBAL Daemon',
  description: 'C++ DBAL daemon deployment, security, and observability.',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" className={`${ibmPlexSans.variable} ${spaceGrotesk.variable}`}>
      <body>
        <NavTabs />
        {children}
      </body>
    </html>
  )
}
