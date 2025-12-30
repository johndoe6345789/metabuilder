/**
 * DBAL Operation Executor
 * 
 * Connects RESTful routes to actual database operations via the DBAL adapter.
 * Handles entity prefixing, tenant isolation, and operation mapping.
 */

import { getAdapter } from '@/lib/db/dbal-client'

import type { DbalOperation } from '../route-parser'
import type { SessionUser } from './get-session-user'
import type { TenantInfo } from './validate-tenant-access'

export interface ExecuteOptions {
  user: SessionUser | null
  tenant: TenantInfo
  body?: Record<string, unknown>
}

export interface ExecuteResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total?: number
    page?: number
    limit?: number
    hasMore?: boolean
  }
}

/**
 * Execute a DBAL operation with tenant isolation
 */
export const executeDbalOperation = async (
  dbalOp: DbalOperation,
  options: ExecuteOptions
): Promise<ExecuteResult> => {
  const adapter = getAdapter()
  const { user, tenant, body } = options

  // All queries must include tenantId for isolation
  const tenantFilter = { tenantId: tenant.id }

  try {
    switch (dbalOp.operation) {
      case 'list': {
        const listOptions = {
          filter: { ...tenantFilter, ...(body?.filter as Record<string, unknown>) },
          sort: body?.sort as Record<string, 'asc' | 'desc'> | undefined,
          page: typeof body?.page === 'number' ? body.page : 1,
          limit: typeof body?.limit === 'number' ? Math.min(body.limit, 100) : 20,
        }
        
        const result = await adapter.list(dbalOp.entity, listOptions)
        
        return {
          success: true,
          data: result.data,
          meta: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            hasMore: result.hasMore,
          },
        }
      }

      case 'read': {
        if (!dbalOp.id) {
          return { success: false, error: 'ID required for read operation' }
        }
        
        const record = await adapter.read(dbalOp.entity, dbalOp.id)
        
        if (!record) {
          return { success: false, error: 'Record not found' }
        }
        
        // Verify tenant isolation
        const recordTenant = (record as Record<string, unknown>).tenantId
        if (recordTenant && recordTenant !== tenant.id) {
          return { success: false, error: 'Record not found' } // Don't leak tenant info
        }
        
        return { success: true, data: record }
      }

      case 'create': {
        const payload = dbalOp.payload || body
        if (!payload || Object.keys(payload).length === 0) {
          return { success: false, error: 'Request body required for create' }
        }
        
        // Build create data, excluding meta fields
        const { id, filter, sort, page, limit, ...cleanPayload } = payload as Record<string, unknown>
        const createData: Record<string, unknown> = {
          ...cleanPayload,
          tenantId: tenant.id,
          createdBy: user?.id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        
        const created = await adapter.create(dbalOp.entity, createData)
        
        return { success: true, data: created }
      }

      case 'update': {
        if (!dbalOp.id) {
          return { success: false, error: 'ID required for update operation' }
        }
        
        const payload = dbalOp.payload || body
        if (!payload || Object.keys(payload).length === 0) {
          return { success: false, error: 'Request body required for update' }
        }
        
        // First verify record exists and belongs to tenant
        const existing = await adapter.read(dbalOp.entity, dbalOp.id)
        if (!existing) {
          return { success: false, error: 'Record not found' }
        }
        
        const existingTenant = (existing as Record<string, unknown>).tenantId
        if (existingTenant && existingTenant !== tenant.id) {
          return { success: false, error: 'Record not found' }
        }
        
        // Build update data, excluding meta fields and protected fields
        const { id, tenantId, filter, sort, page, limit, ...cleanPayload } = payload as Record<string, unknown>
        const updateData: Record<string, unknown> = {
          ...cleanPayload,
          updatedBy: user?.id,
          updatedAt: Date.now(),
        }
        
        const updated = await adapter.update(dbalOp.entity, dbalOp.id, updateData)
        
        return { success: true, data: updated }
      }

      case 'delete': {
        if (!dbalOp.id) {
          return { success: false, error: 'ID required for delete operation' }
        }
        
        // First verify record exists and belongs to tenant
        const existing = await adapter.read(dbalOp.entity, dbalOp.id)
        if (!existing) {
          return { success: false, error: 'Record not found' }
        }
        
        const existingTenant = (existing as Record<string, unknown>).tenantId
        if (existingTenant && existingTenant !== tenant.id) {
          return { success: false, error: 'Record not found' }
        }
        
        const deleted = await adapter.delete(dbalOp.entity, dbalOp.id)
        
        return { success: true, data: { deleted, id: dbalOp.id } }
      }

      case 'action': {
        // Custom actions need to be handled by package-specific handlers
        // For now, return info about what action was requested
        return {
          success: false,
          error: `Custom action not implemented. Package handlers should override this.`,
        }
      }

      default:
        return { success: false, error: `Unknown operation: ${dbalOp.operation}` }
    }
  } catch (error) {
    console.error('DBAL operation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Operation failed',
    }
  }
}

/**
 * Execute a custom package action
 * This is a placeholder - packages can register custom action handlers
 */
export const executePackageAction = async (
  packageId: string,
  entity: string,
  action: string,
  id: string | null,
  options: ExecuteOptions
): Promise<ExecuteResult> => {
  // TODO: Look up package-registered action handlers
  // For now, handle some common built-in actions
  
  const adapter = getAdapter()
  const { tenant, body } = options
  const prefixedEntity = `Pkg_${toPascalCase(packageId)}_${entity}`

  switch (action.toLowerCase()) {
    case 'count': {
      // Count records matching filter
      const result = await adapter.list(prefixedEntity, {
        filter: { tenantId: tenant.id, ...(body?.filter as Record<string, unknown>) },
        limit: 1,
      })
      return { success: true, data: { count: result.total || 0 } }
    }

    case 'exists': {
      // Check if record exists
      if (!id) {
        return { success: false, error: 'ID required for exists check' }
      }
      const record = await adapter.read(prefixedEntity, id)
      const exists = record !== null && 
        (record as Record<string, unknown>).tenantId === tenant.id
      return { success: true, data: { exists } }
    }

    case 'schema': {
      // Return entity schema info (useful for form generation)
      // TODO: Load from package schema.yaml
      return {
        success: true,
        data: {
          entity: prefixedEntity,
          package: packageId,
          // fields: would come from schema
        },
      }
    }

    default:
      return {
        success: false,
        error: `Unknown action '${action}' for package '${packageId}'`,
      }
  }
}

/**
 * Convert snake_case to PascalCase
 */
const toPascalCase = (str: string): string => {
  return str
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')
}
