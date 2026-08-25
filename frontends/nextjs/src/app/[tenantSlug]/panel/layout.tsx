/**
 * /{tenant}/panel — everything with chrome.
 *
 * The app bar and sidebar stop here. A published page at /{tenant} or
 * /{tenant}/{route} renders on its own, because chrome belongs to the tool
 * rather than to what the tool produced. AuthProvider is deliberately not
 * here but in the tenant layout above: bare pages need auth state too.
 */
'use client'

import { AppShell } from '@/components/layout'

export default function TenantPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
