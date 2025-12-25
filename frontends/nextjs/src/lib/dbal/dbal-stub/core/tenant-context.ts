/**
 * DBAL Tenant Context Stub
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

export interface TenantContext {
  tenantId: string
  userId?: string
}

export class InMemoryTenantManager {
  private currentTenant: string | null = null

  setCurrentTenant(tenantId: string): void {
    this.currentTenant = tenantId
  }

  getCurrentTenant(): string | null {
    return this.currentTenant
  }

  async createTenant(_id: string, _metadata: Record<string, any>, ..._args: any[]): Promise<void> {
    // Stub implementation
  }

  async getTenantContext(tenantId: string, userId?: string): Promise<TenantContext> {
    return { tenantId, userId }
  }
}
