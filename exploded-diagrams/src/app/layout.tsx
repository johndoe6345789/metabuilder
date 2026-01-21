import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.scss'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Exploded Diagrams',
  description: 'Interactive exploded diagram viewer for technical illustrations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="app">
          <header className="header">
            <h1 className="title">EXPLODED DIAGRAMS</h1>
            <p className="subtitle">Modular Technical Illustrations</p>
          </header>
          {children}
        </div>
      </body>
    </html>
  )
}
