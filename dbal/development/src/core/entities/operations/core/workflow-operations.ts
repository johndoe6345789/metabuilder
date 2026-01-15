/**
 * @file workflow-operations.ts
 * @description Workflow entity CRUD operations for DBAL client
 */

import { randomUUID } from 'crypto'
import type { DBALAdapter } from '../../../../adapters/adapter'
import { DBALError } from '../../../foundation/errors'
import type { CreateWorkflowInput, ListOptions, ListResult, UpdateWorkflowInput, Workflow } from '../../../foundation/types'
import { validateId, validateWorkflowCreate, validateWorkflowUpdate } from '../../../foundation/validation'

export interface WorkflowOperations {
  create: (data: CreateWorkflowInput) => Promise<Workflow>
  read: (id: string) => Promise<Workflow | null>
  update: (id: string, data: UpdateWorkflowInput) => Promise<Workflow>
  delete: (id: string) => Promise<boolean>
  list: (options?: ListOptions) => Promise<ListResult<Workflow>>
}

const assertValidId = (id: string) => {
  const errors = validateId(id)
  if (errors.length > 0) {
    throw DBALError.validationError('Invalid workflow ID', errors.map(error => ({ field: 'id', error })))
  }
}

const assertValidCreate = (data: CreateWorkflowInput | Workflow) => {
  const normalized: Record<string, unknown> = { ...data }
  if (!data.description) {
    delete normalized.description
  }
  const errors = validateWorkflowCreate(normalized as Partial<Workflow>)
  if (errors.length > 0) {
    throw DBALError.validationError('Invalid workflow data', errors.map(error => ({ field: 'workflow', error })))
  }
}

const assertValidUpdate = (data: UpdateWorkflowInput) => {
  const normalized: Record<string, unknown> = { ...data }
  if (!data.description) {
    delete normalized.description
  }
  const errors = validateWorkflowUpdate(normalized as Partial<Workflow>)
  if (errors.length > 0) {
    throw DBALError.validationError('Invalid workflow update data', errors.map(error => ({ field: 'workflow', error })))
  }
}

const resolveTenantId = (configuredTenantId?: string, data?: Partial<Workflow>): string | null => {
  if (configuredTenantId && configuredTenantId.length > 0) return configuredTenantId
  const tenantId = data?.tenantId
  if (typeof tenantId === 'string' && tenantId.length > 0) return tenantId
  return null
}

const resolveTenantFilter = (
  configuredTenantId: string | undefined,
  filter?: Record<string, unknown>,
): Record<string, unknown> | null => {
  if (configuredTenantId && configuredTenantId.length > 0) {
    return { ...(filter ?? {}), tenantId: configuredTenantId }
  }
  const candidate = filter?.tenantId ?? filter?.tenant_id
  if (typeof candidate === 'string' && candidate.length > 0) {
    return { ...(filter ?? {}), tenantId: candidate }
  }
  return null
}

const withWorkflowDefaults = (data: CreateWorkflowInput): Workflow => {
  const now = BigInt(Date.now())
  const base = {
    id: data.id ?? randomUUID(),
    tenantId: data.tenantId ?? null,
    name: data.name,
    nodes: data.nodes,
    edges: data.edges,
    enabled: data.enabled,
    version: data.version ?? 1,
    createdAt: data.createdAt ?? now,
    updatedAt: data.updatedAt ?? now,
    createdBy: data.createdBy ?? null,
  }
  const workflow: Workflow = {
    ...base,
    ...(data.description && { description: data.description }),
  }
  return workflow
}

export const createWorkflowOperations = (adapter: DBALAdapter, tenantId?: string): WorkflowOperations => ({
  create: async data => {
    const normalized = {
      ...data,
      description: data.description ?? undefined,
    }
    const resolvedTenantId = resolveTenantId(tenantId, normalized as Partial<Workflow>)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    const payload = withWorkflowDefaults({ ...data, tenantId: resolvedTenantId })
    assertValidCreate(payload)
    try {
      return await adapter.create('Workflow', payload) as Workflow
    } catch (error) {
      if ((error as any)?.code === 409) {
        const name = typeof data.name === 'string' ? data.name : 'unknown'
        throw DBALError.conflict(`Workflow with name '${name}' already exists`)
      }
      throw error
    }
  },
  read: async id => {
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidId(id)
    const result = await adapter.findFirst('Workflow', { id, tenantId: resolvedTenantId }) as Workflow | null
    if (!result) {
      throw DBALError.notFound(`Workflow not found: ${id}`)
    }
    return result
  },
  update: async (id, data) => {
    if (data.tenantId !== undefined) {
      throw DBALError.validationError('Tenant ID cannot be updated', [{ field: 'tenantId', error: 'tenantId is immutable' }])
    }
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidId(id)
    assertValidUpdate(data)
    const existing = await adapter.findFirst('Workflow', { id, tenantId: resolvedTenantId }) as Workflow | null
    if (!existing) {
      throw DBALError.notFound(`Workflow not found: ${id}`)
    }
    try {
      return await adapter.update('Workflow', id, data) as Workflow
    } catch (error) {
      if ((error as any)?.code === 409) {
        if (typeof data.name === 'string') {
          throw DBALError.conflict(`Workflow with name '${data.name}' already exists`)
        }
        throw DBALError.conflict('Workflow name already exists')
      }
      throw error
    }
  },
  delete: async id => {
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidId(id)
    const existing = await adapter.findFirst('Workflow', { id, tenantId: resolvedTenantId }) as Workflow | null
    if (!existing) {
      throw DBALError.notFound(`Workflow not found: ${id}`)
    }
    const result = await adapter.delete('Workflow', id)
    if (!result) {
      throw DBALError.notFound(`Workflow not found: ${id}`)
    }
    return result
  },
  list: options => {
    const tenantFilter = resolveTenantFilter(tenantId, options?.filter)
    if (!tenantFilter) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    return adapter.list('Workflow', { ...options, filter: tenantFilter }) as Promise<ListResult<Workflow>>
  },
})
