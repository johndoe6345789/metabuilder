'use client'

/**
 * Tenant Context
 * 
 * Provides tenant and package information to all components
 * within the tenant-scoped routes.
 */

import { createContext, useContext, type ReactNode } from 'react'
import {
  getPrefixedEntity,
  getTableName,
  toPascalCase,
} from '@/lib/routing/route-parser'

interface TenantContextValue {
  tenant: string
  packageId: string
  
  // Helper functions
  getPrefixedEntity: (entity: string) => string
  getTableName: (entity: string) => string
  
  // Build API URL for this tenant/package
  buildApiUrl: (entity: string, id?: string, action?: string) => string
}

const TenantContext = createContext<TenantContextValue | null>(null)

interface TenantProviderProps {
  tenant: string
  packageId: string
  children: ReactNode
}

export function TenantProvider({ tenant, packageId, children }: TenantProviderProps) {
  const value: TenantContextValue = {
    tenant,
    packageId,
    
    getPrefixedEntity: (entity: string) => getPrefixedEntity(packageId, entity),
    getTableName: (entity: string) => getTableName(packageId, entity),
    
    buildApiUrl: (entity: string, id?: string, action?: string) => {
      let url = `/api/v1/${tenant}/${packageId}/${entity}`
      if (id) url += `/${id}`
      if (action) url += `/${action}`
      return url
    },
  }

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
  
  if (!context) {
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
