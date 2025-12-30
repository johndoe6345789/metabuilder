/**
 * Tenant-Scoped Layout
 * 
 * This layout wraps all pages under /{tenant}/{package}/...
 * It provides tenant context to all child components.
 */

import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { TenantProvider } from './tenant-context'

interface TenantLayoutProps {
  children: React.ReactNode
  params: Promise<{
    tenant: string
    package: string
  }>
}

export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps) {
  const resolvedParams = await params
  const { tenant, package: pkg } = resolvedParams

  // Validate tenant exists
  // TODO: Check against database
  // const tenantData = await getTenant(tenant)
  // if (!tenantData) {
  //   notFound()
  // }

  // Validate package exists and is installed for tenant
  // TODO: Check against database
  // const packageInstalled = await isPackageInstalled(tenant, pkg)
  // if (!packageInstalled) {
  //   notFound()
  // }

  return (
    <TenantProvider tenant={tenant} packageId={pkg}>
      <div className="tenant-layout" data-tenant={tenant} data-package={pkg}>
        {children}
      </div>
    </TenantProvider>
  )
}
