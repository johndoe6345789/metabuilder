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
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { AppShell } from '@/components/layout'
import { useTenantUrl } from '@/lib/tenant/use-tenant-url'

/** Sends a signed-in visitor to the tenant-scoped twin of this route. */
function TenantUrlGuard({ children }: { children: React.ReactNode }) {
  const auth = useAuthContext()
  useTenantUrl(auth.user?.tenantId, auth.isAuthenticated, auth.isLoading)
  return <>{children}</>
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TenantUrlGuard>
        <AppShell>{children}</AppShell>
      </TenantUrlGuard>
    </AuthProvider>
  )
}
