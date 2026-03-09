/**
 * Type stub for @/app/[tenant]/[package]/tenant-context
 * Provides tenant context for REST API hooks.
 */

export interface TenantContext {
  tenant: string
  packageId: string
  primaryPackage: string
  hasPackage: (packageId: string) => boolean
}

/**
 * Hook that returns the tenant context or null if not available.
 * Used by useRestApi to resolve tenant/package from the route.
 */
export declare function useTenantOptional(): TenantContext | null
