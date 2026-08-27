/**
 * /{tenant} — everything for one tenant, with or without chrome.
 *
 * AuthProvider sits here rather than in panel/layout.tsx because auth state
 * is not chrome: a published page at /{tenant} renders bare, but still has to
 * know who is looking at it, since WorkspacePageSlot level-gates whatever it
 * renders. The app bar and sidebar are what stop at /{tenant}/panel.
 */
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { AuthProvider } from '@/app/_components/auth-provider'
import { TenantStyleSheet } from '@/components/workspace/TenantStyleSheet'
import { normalizeTenantId } from '@/lib/tenant/workspace-paths'
import { tenantExists } from '@/lib/tenant/tenant-exists'

const DBAL =
  process.env.DBAL_ENDPOINT ??
  process.env.DBAL_API_URL ??
  process.env.NEXT_PUBLIC_DBAL_API_URL ??
  'http://localhost:8080'

export default async function TenantRootLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ tenantSlug?: string }>
}) {
  const { tenantSlug } = await params
  const tenant = normalizeTenantId(tenantSlug)
  if (!(await tenantExists(DBAL, tenant))) notFound()
  return (
    <div className="tenant-root">
      <TenantStyleSheet tenant={tenant} />
      <AuthProvider>{children}</AuthProvider>
    </div>
  )
}
