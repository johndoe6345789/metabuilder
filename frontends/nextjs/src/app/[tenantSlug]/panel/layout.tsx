/**
 * /{tenant}/panel — everything with chrome.
 *
 * The app bar and sidebar stop here. A published page at /{tenant} or
 * /{tenant}/{route} renders on its own, because chrome belongs to the tool
 * rather than to what the tool produced.
 */
'use client'

import { AuthProvider } from '@/app/_components/auth-provider'
import { AppShell } from '@/components/layout'

export default function TenantPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  )
}
