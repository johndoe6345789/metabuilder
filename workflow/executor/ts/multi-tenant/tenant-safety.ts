/**
 * Multi-Tenant Safety Layer - Enforces tenant isolation at execution layer
 * @packageDocumentation
 */

export interface TenantContext {
  tenantId: string
  userId?: string
  sessionId?: string
  timestamp: number
}

export interface TenantValidationResult {
  valid: boolean
  errors: string[]
  context?: TenantContext
}

export class TenantSafetyManager {
  private activeContexts: Map<string, TenantContext> = new Map()
  private readonly maxContextsPerTenant = 100

  /**
   * Establish tenant context for workflow execution
   */
  establishContext(tenantId: string, userId?: string, sessionId?: string): TenantContext {
    if (!tenantId) {
      throw new Error('tenantId is required for workflow execution')
    }

    const context: TenantContext = {
      tenantId,
      userId,
      sessionId,
      timestamp: Date.now()
    }

    // Store context (keyed by sessionId if available, otherwise userId, otherwise tenantId)
    const contextKey = sessionId || userId || tenantId
    this.activeContexts.set(contextKey, context)

    // Cleanup old contexts to prevent memory leak
    if (this.activeContexts.size > this.maxContextsPerTenant * 10) {
      this.cleanupOldContexts()
    }

    return context
  }

  /**
   * Validate tenant context
   */
  validateContext(tenantId: string, context?: TenantContext): TenantValidationResult {
    const errors: string[] = []

    if (!tenantId) {
      errors.push('tenantId is required')
    }

    if (context && context.tenantId !== tenantId) {
      errors.push(
        `Context tenantId (${context.tenantId}) does not match execution tenantId (${tenantId})`
      )
    }

    return {
      valid: errors.length === 0,
      errors,
      context
    }
  }

  /**
   * Enforce tenant isolation on workflow data
   */
  enforceIsolation(data: any, tenantId: string): any {
    if (!data) return data

    // For objects, add tenantId enforcement
    if (typeof data === 'object' && !Array.isArray(data)) {
      if (data.tenantId && data.tenantId !== tenantId) {
        throw new Error(
          `Data belongs to tenant ${data.tenantId}, but execution is for tenant ${tenantId}`
        )
      }
      return { ...data, tenantId }
    }

    // For arrays, validate each item
    if (Array.isArray(data)) {
      return data.map(item => this.enforceIsolation(item, tenantId))
    }

    return data
  }

  /**
   * Filter data by tenant
   */
  filterByTenant<T extends { tenantId?: string }>(items: T[], tenantId: string): T[] {
    return items.filter(item => !item.tenantId || item.tenantId === tenantId)
  }

  /**
   * Check if data access is authorized for tenant
   */
  isAuthorized(tenantId: string, resourceTenantId?: string): boolean {
    // If resource has no tenantId, it's public/shared
    if (!resourceTenantId) return true

    // Resource must belong to requesting tenant
    return resourceTenantId === tenantId
  }

  /**
   * Get current context
   */
  getContext(contextKey: string): TenantContext | undefined {
    return this.activeContexts.get(contextKey)
  }

  /**
   * Clear context
   */
  clearContext(contextKey: string): void {
    this.activeContexts.delete(contextKey)
  }

  /**
   * Get all active contexts for a tenant
   */
  getContextsByTenant(tenantId: string): TenantContext[] {
    const contexts: TenantContext[] = []
    this.activeContexts.forEach(context => {
      if (context.tenantId === tenantId) {
        contexts.push(context)
      }
    })
    return contexts
  }

  /**
   * Cleanup old contexts (older than 1 hour)
   */
  private cleanupOldContexts(): void {
    const oneHourAgo = Date.now() - 3600000
    this.activeContexts.forEach((context, key) => {
      if (context.timestamp < oneHourAgo) {
        this.activeContexts.delete(key)
      }
    })
  }

  /**
   * Get context statistics
   */
  getStats() {
    const stats = {
      totalContexts: this.activeContexts.size,
      byTenant: new Map<string, number>(),
      oldestContext: 0,
      newestContext: 0
    }

    let oldest = Date.now()
    let newest = 0

    this.activeContexts.forEach(context => {
      stats.byTenant.set(
        context.tenantId,
        (stats.byTenant.get(context.tenantId) || 0) + 1
      )
      oldest = Math.min(oldest, context.timestamp)
      newest = Math.max(newest, context.timestamp)
    })

    stats.oldestContext = oldest
    stats.newestContext = newest

    return stats
  }
}
