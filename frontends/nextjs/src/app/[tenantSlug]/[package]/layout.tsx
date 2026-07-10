'use client'

/**
 * Tenant-Scoped Layout
 *
 * Wraps all pages under /{tenantSlug}/{package}/...
 * Provides tenant context to all child components.
 * Validation happens client-side via useDBAL, not SSR.
 */

import { useParams } from 'next/navigation'
import { TenantProvider } from './tenant-context'

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams<{ tenantSlug: string; package: string }>()
  const tenantSlug = params.tenantSlug
  const pkg = params.package

  return (
    <TenantProvider tenant={tenantSlug} packageId={pkg}>
      <div
        className="tenant-layout"
        data-tenant={tenantSlug}
        data-package={pkg}
      >
        {children}
      </div>
    </TenantProvider>
  )
}
