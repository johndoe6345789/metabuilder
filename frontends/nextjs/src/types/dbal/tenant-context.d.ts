/* eslint-disable @typescript-eslint/no-explicit-any */

declare module '@/dbal/development/src/core/tenant-context' {
  export interface TenantContext {
    tenantId: string
    userId?: string
  }

  export class InMemoryTenantManager {
    setCurrentTenant(tenantId: string): void
    getCurrentTenant(): string | null
    createTenant(id: string, metadata: Record<string, any>, ...args: any[]): Promise<void>
    getTenantContext(tenantId: string, userId?: string): Promise<TenantContext>
  }
}
