'use client'

/**
 * Tenant Context
 * 
 * Provides tenant and package information to all components
 * within the tenant-scoped routes.
 * 
 * A page has one PRIMARY package (from the URL) but may use
 * components and data from additional packages (dependencies).
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import {
  getPrefixedEntity,
  getTableName,
} from '@/lib/routing/route-parser'

interface PackageInfo {
  id: string
  name?: string
  minLevel?: number
  /** Whether this package can own routes (true) or is dependency-only (false) */
  primary?: boolean
}

interface TenantContextValue {
  tenant: string
  
  // Primary package (owns this route)
  primaryPackage: string
  
  // All available packages for this page (primary + dependencies)
  packages: PackageInfo[]
  
  // Legacy alias for primaryPackage
  packageId: string
  
  // Helper functions scoped to primary package
  getPrefixedEntity: (entity: string) => string
  getTableName: (entity: string) => string
  
  // Build API URL - defaults to primary package, can specify other package
  buildApiUrl: (entity: string, id?: string, action?: string, packageId?: string) => string
  
  // Check if a package is available on this page
  hasPackage: (packageId: string) => boolean
  
  // Get prefixed entity for a specific package
  getPrefixedEntityForPackage: (packageId: string, entity: string) => string
}

const TenantContext = createContext<TenantContextValue | null>(null)

interface TenantProviderProps {
  tenant: string
  packageId: string
  /** Additional packages available on this page (from dependencies) */
  additionalPackages?: PackageInfo[]
  children: ReactNode
}

export function TenantProvider({ 
  tenant, 
  packageId, 
  additionalPackages = [],
  children 
}: TenantProviderProps) {
  // Combine primary package with additional packages
  const packages = useMemo(() => {
    const primary: PackageInfo = { id: packageId }
    const all = [primary, ...additionalPackages]
    // Deduplicate by id
    return all.filter((pkg, idx) => all.findIndex(p => p.id === pkg.id) === idx)
  }, [packageId, additionalPackages])

  const value: TenantContextValue = useMemo(() => ({
    tenant,
    primaryPackage: packageId,
    packages,
    packageId, // Legacy alias
    
    getPrefixedEntity: (entity: string) => getPrefixedEntity(packageId, entity),
    getTableName: (entity: string) => getTableName(packageId, entity),
    
    buildApiUrl: (entity: string, id?: string, action?: string, pkg?: string) => {
      const targetPkg = pkg ?? packageId
      let url = `/api/v1/${tenant}/${targetPkg}/${entity}`
      if (id !== undefined) url += `/${id}`
      if (action !== undefined) url += `/${action}`
      return url
    },
    
    hasPackage: (pkgId: string) => packages.some(p => p.id === pkgId),
    
    getPrefixedEntityForPackage: (pkgId: string, entity: string) => 
      getPrefixedEntity(pkgId, entity),
  }), [tenant, packageId, packages])

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  )
}

/**
 * Hook to access tenant context
 */
export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext)
  
  if (context === null) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  
  return context
}

/**
 * Hook to check if we're in a tenant context
 */
export function useTenantOptional(): TenantContextValue | null {
  return useContext(TenantContext)
}
