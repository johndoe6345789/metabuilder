/**
 * /{tenant} — everything for one tenant, with or without chrome.
 *
 * AuthProvider sits here rather than in panel/layout.tsx because auth state
 * is not chrome: a published page at /{tenant} renders bare, but still has to
 * know who is looking at it, since WorkspacePageSlot level-gates whatever it
 * renders. The app bar and sidebar are what stop at /{tenant}/panel.
 */
import type { ReactNode } from 'react'
import { AuthProvider } from '@/app/_components/auth-provider'
import { TenantStyleSheet } from '@/components/workspace/TenantStyleSheet'
import { normalizeTenantId } from '@/lib/tenant/workspace-paths'

export default async function TenantRootLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ tenantSlug?: string }>
}) {
  const { tenantSlug } = await params
  const tenant = normalizeTenantId(tenantSlug)
  return (
    <div className="tenant-root">
      <TenantStyleSheet tenant={tenant} />
      <AuthProvider>{children}</AuthProvider>
    </div>
  )
}
