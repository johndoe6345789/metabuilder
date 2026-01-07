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

import { getAdapter } from '@/lib/db/core/dbal-client'
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
 * Handles individual dependency failures gracefully.
 */
async function getPackageDependencies(packageId: string): Promise<{ id: string; name?: string }[]> {
  const metadata = await loadPackageMetadata(packageId) as { dependencies?: string[]; name?: string; minLevel?: number } | null
  if (metadata?.dependencies === undefined || metadata.dependencies.length === 0) {
    return []
  }
  
  const deps = await Promise.all(
    metadata.dependencies.map(async depId => {
      try {
        const depMetadata = await loadPackageMetadata(depId) as { name?: string; minLevel?: number } | null
        return {
          id: depId,
          name: depMetadata?.name,
          minLevel: depMetadata?.minLevel,
        }
      } catch {
        // Return minimal info if dependency metadata fails to load
        return { id: depId }
      }
    })
  )
  
  return deps
}

/**
 * Validate tenant exists in database
 */
async function validateTenant(tenantSlug: string): Promise<{ id: string; name: string } | null> {
  try {
    const adapter = getAdapter()
    const tenant = await adapter.findFirst('Tenant', {
      where: { slug: tenantSlug },
    })
    
    if (tenant === null || tenant === undefined) {
      return null
    }
    
    const record = tenant as { id?: string; name?: string }
    if (typeof record.id !== 'string' || typeof record.name !== 'string') {
      return null
    }
    
    return { id: record.id, name: record.name }
  } catch {
    return null
  }
}

/**
 * Check if package is installed for tenant
 */
async function isPackageInstalled(tenantId: string, packageId: string): Promise<boolean> {
  try {
    const adapter = getAdapter()
    const installed = await adapter.findFirst('InstalledPackage', {
      where: { packageId, tenantId, enabled: true },
    })
    
    return installed !== null && installed !== undefined
  } catch {
    return false
  }
}

export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps) {
  const resolvedParams = await params
  const { tenant, package: pkg } = resolvedParams

  // Load primary package metadata
  const packageMetadata = await loadPackageMetadata(pkg)
  if (packageMetadata === null || packageMetadata === undefined) {
    // Package doesn't exist
    notFound()
  }

  // Verify package can be primary (not dependency-only)
  if (!canBePrimaryPackage(pkg)) {
    // Package has primary: false, can only be used as dependency
    notFound()
  }

  // Validate tenant exists
  const tenantData = await validateTenant(tenant)
  if (tenantData === null) {
    notFound()
  }

  // Validate package is installed for this tenant
  const packageInstalled = await isPackageInstalled(tenantData.id, pkg)
  if (!packageInstalled) {
    notFound()
  }

  // Load dependencies that this page can also use
  const additionalPackages = await getPackageDependencies(pkg)

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
