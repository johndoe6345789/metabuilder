declare module '@/dbal/development/src/core/tenant-context' {
  import type { PropertyBag } from '@/types/utility-types'

  export interface TenantContext {
    tenantId: string
    userId?: string
  }

  export class InMemoryTenantManager {
    setCurrentTenant(tenantId: string): void
    getCurrentTenant(): string | null
    createTenant(id: string, metadata: PropertyBag, ...args: unknown[]): Promise<void>
    getTenantContext(tenantId: string, userId?: string): Promise<TenantContext>
  }
}
