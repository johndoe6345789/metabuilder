/**
 * Tenant-Scoped Layout
 * 
 * This layout wraps all pages under /{tenant}/{package}/...
 * It provides tenant context to all child components.
 * 
 * A page has one PRIMARY package (from the URL) but may use
 * components and data from additional packages (dependencies).
 */

import { notFound } from 'next/navigation'

import { loadPackageMetadata } from '@/lib/routing/auth/validate-package-route'

import { TenantProvider } from './tenant-context'

interface TenantLayoutProps {
  children: React.ReactNode
  params: Promise<{
    tenant: string
    package: string
  }>
}

/**
 * Load package dependencies recursively (1 level deep for now)
 */
function getPackageDependencies(packageId: string): { id: string; name?: string }[] {
  const metadata = loadPackageMetadata(packageId)
  if (!metadata?.dependencies) {
    return []
  }
  
  return metadata.dependencies.map(depId => {
    const depMetadata = loadPackageMetadata(depId)
    return {
      id: depId,
      name: depMetadata?.name,
      minLevel: depMetadata?.minLevel,
    }
  })
}

export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps) {
  const resolvedParams = await params
  const { tenant, package: pkg } = resolvedParams

  // Load primary package metadata
  const packageMetadata = loadPackageMetadata(pkg)
  if (!packageMetadata) {
    // Package doesn't exist
    notFound()
  }

  // Load dependencies that this page can also use
  const additionalPackages = getPackageDependencies(pkg)

  // TODO: Validate tenant exists against database
  // const tenantData = await getTenant(tenant)
  // if (!tenantData) {
  //   notFound()
  // }

  // TODO: Validate package is installed for this tenant
  // const packageInstalled = await isPackageInstalled(tenant, pkg)
  // if (!packageInstalled) {
  //   notFound()
  // }

  return (
    <TenantProvider 
      tenant={tenant} 
      packageId={pkg}
      additionalPackages={additionalPackages}
    >
      <div 
        className="tenant-layout" 
        data-tenant={tenant} 
        data-package={pkg}
        data-packages={[pkg, ...additionalPackages.map(p => p.id)].join(',')}
      >
        {children}
      </div>
    </TenantProvider>
  )
}
