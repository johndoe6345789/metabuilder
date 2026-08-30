'use client'

/**
 * Tenant Context
 *
 * Provides tenant and package information to all components within the
 * tenant-scoped routes.
 *
 * A page has one PRIMARY package (from the URL) but may use components
 * and data from additional packages (dependencies).
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { PackageInfo, TenantContextValue } from './tenant-context-types'
import { buildTenantContextValue, combinePackages } from './tenant-context-value'

export type { PackageInfo, TenantContextValue }

const TenantContext = createContext<TenantContextValue | null>(null)

interface TenantProviderProps {
  tenant: string
  packageId: string
  /** Additional packages available on this page (from dependencies). */
  additionalPackages?: PackageInfo[]
  children: ReactNode
}

export function TenantProvider({
  tenant,
  packageId,
  additionalPackages = [],
  children,
}: TenantProviderProps) {
  const packages = useMemo(
    () => combinePackages(packageId, additionalPackages),
    [packageId, additionalPackages]
  )

  const value = useMemo(
    () => buildTenantContextValue(tenant, packageId, packages),
    [tenant, packageId, packages]
  )

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  )
}

/** The tenant context for the current route. Throws outside a provider. */
export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext)
  if (context === null) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}

/** The tenant context for the current route, or null outside a provider. */
export function useTenantOptional(): TenantContextValue | null {
  return useContext(TenantContext)
}
