import type { ListOptions, ListResult } from '../../core/foundation/types'
import type { ACLContext } from './context'
import { enforceRowAccess, withAudit } from './guards'

export const createEntity = (context: ACLContext) => async (entity: string, data: Record<string, unknown>) => {
  return withAudit(context, entity, 'create', () => context.baseAdapter.create(entity, data))
}

export const readEntity = (context: ACLContext) => async (entity: string, id: string) => {
  return withAudit(context, entity, 'read', async () => {
    const result = await context.baseAdapter.read(entity, id)
    if (result) {
      enforceRowAccess(context, entity, 'read', result as Record<string, unknown>)
    }
    return result
  })
}

export const updateEntity = (context: ACLContext) => async (entity: string, id: string, data: Record<string, unknown>) => {
  return withAudit(context, entity, 'update', async () => {
    const existing = await context.baseAdapter.read(entity, id)
    if (existing) {
      enforceRowAccess(context, entity, 'update', existing as Record<string, unknown>)
    }
    return context.baseAdapter.update(entity, id, data)
  })
}

export const deleteEntity = (context: ACLContext) => async (entity: string, id: string) => {
  return withAudit(context, entity, 'delete', async () => {
    const existing = await context.baseAdapter.read(entity, id)
    if (existing) {
      enforceRowAccess(context, entity, 'delete', existing as Record<string, unknown>)
    }
    return context.baseAdapter.delete(entity, id)
  })
}

export const listEntities = (context: ACLContext) => async (entity: string, options?: ListOptions): Promise<ListResult<unknown>> => {
  return withAudit(context, entity, 'list', () => context.baseAdapter.list(entity, options))
}
