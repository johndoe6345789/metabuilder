/**
 * App Layout
 *
 * Wraps all /app/* routes with the AppShell (sidebar + appbar).
 * This is the authenticated area of the application.
 * The AppShell provides:
 * - AppBar with level navigation, DBAL status, theme toggle
 * - Sidebar with level-filtered nav items and dynamic packages
 * - Main content area
 *
 * Mirrors the Qt6 App.qml RowLayout structure.
 */
'use client'

import { AuthProvider } from '@/app/_components/auth-provider'
import { AppShell } from '@/components/layout'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>
        {children}
      </AppShell>
    </AuthProvider>
  )
}
