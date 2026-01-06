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

import { canBePrimaryPackage, loadPackageMetadata } from '@/lib/routing/auth/validate-package-route'

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
async function getPackageDependencies(packageId: string): Promise<{ id: string; name?: string }[]> {
  const metadata = await loadPackageMetadata(packageId) as { dependencies?: string[]; name?: string; minLevel?: number } | null
  if (metadata?.dependencies === undefined || metadata.dependencies.length === 0) {
    return []
  }
  
  const deps = await Promise.all(
    metadata.dependencies.map(async depId => {
      const depMetadata = await loadPackageMetadata(depId) as { name?: string; minLevel?: number } | null
      return {
        id: depId,
        name: depMetadata?.name,
        minLevel: depMetadata?.minLevel,
      }
    })
  )
  
  return deps
}

export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps) {
  const resolvedParams = await params
  const { tenant, package: pkg } = resolvedParams

  // Load primary package metadata
  const packageMetadata = loadPackageMetadata(pkg)
  if (packageMetadata === null || packageMetadata === undefined) {
    // Package doesn't exist
    notFound()
  }

  // Verify package can be primary (not dependency-only)
  if (!canBePrimaryPackage(pkg)) {
    // Package has primary: false, can only be used as dependency
    notFound()
  }

  // Load dependencies that this page can also use
  const additionalPackages = await getPackageDependencies(pkg)

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
