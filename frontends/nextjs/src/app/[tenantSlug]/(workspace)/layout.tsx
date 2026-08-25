/**
 * Tenant-scoped workspace layout.
 *
 * Same shell as /app/(workspace), mounted under /app/{tenant}/... so that a
 * signed-in user always has their tenant in the URL. A route group, so it
 * adds the shell without adding a path segment, and without touching
 * [tenantSlug]/[package] or [tenantSlug]/god-panel, which bring their own.
 */
'use client'

import { AuthProvider } from '@/app/_components/auth-provider'
import { AppShell } from '@/components/layout'

export default function TenantWorkspaceLayout({
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
