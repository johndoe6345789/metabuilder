'use client'

/**
 * Tenant-Scoped Layout
 *
 * Wraps all pages under /{tenant}/{package}/...
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
  const params = useParams<{ tenant: string; package: string }>()
  const tenant = params.tenant
  const pkg = params.package

  return (
    <TenantProvider tenant={tenant} packageId={pkg}>
      <div
        className="tenant-layout"
        data-tenant={tenant}
        data-package={pkg}
      >
        {children}
      </div>
    </TenantProvider>
  )
}
