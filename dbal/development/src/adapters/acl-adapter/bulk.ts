import type { ACLContext } from './context'
import { enforceRowAccess, resolveOperation, withAudit } from './guards'

export const findFirst = (context: ACLContext) => async (entity: string, filter?: Record<string, unknown>) => {
  const operation = resolveOperation('findFirst')
  return withAudit(context, entity, operation, async () => {
    const result = await context.baseAdapter.findFirst(entity, filter)
    if (result) {
      enforceRowAccess(context, entity, operation, result as Record<string, unknown>)
    }
    return result
  })
}

export const findByField = (context: ACLContext) => async (entity: string, field: string, value: unknown) => {
  const operation = resolveOperation('findByField')
  return withAudit(context, entity, operation, async () => {
    const result = await context.baseAdapter.findByField(entity, field, value)
    if (result) {
      enforceRowAccess(context, entity, operation, result as Record<string, unknown>)
    }
    return result
  })
}

export const upsert = (context: ACLContext) => async (
  entity: string,
  filter: Record<string, unknown>,
  createData: Record<string, unknown>,
  updateData: Record<string, unknown>,
) => {
  return withAudit(context, entity, 'upsert', () => context.baseAdapter.upsert(entity, filter, createData, updateData))
}

export const updateByField = (context: ACLContext) => async (
  entity: string,
  field: string,
  value: unknown,
  data: Record<string, unknown>,
) => {
  const operation = resolveOperation('updateByField')
  return withAudit(context, entity, operation, () => context.baseAdapter.updateByField(entity, field, value, data))
}

export const deleteByField = (context: ACLContext) => async (entity: string, field: string, value: unknown) => {
  const operation = resolveOperation('deleteByField')
  return withAudit(context, entity, operation, () => context.baseAdapter.deleteByField(entity, field, value))
}

export const createMany = (context: ACLContext) => async (entity: string, data: Record<string, unknown>[]) => {
  const operation = resolveOperation('createMany')
  return withAudit(context, entity, operation, () => context.baseAdapter.createMany(entity, data))
}

export const updateMany = (context: ACLContext) => async (
  entity: string,
  filter: Record<string, unknown>,
  data: Record<string, unknown>,
) => {
  const operation = resolveOperation('updateMany')
  return withAudit(context, entity, operation, () => context.baseAdapter.updateMany(entity, filter, data))
}

export const deleteMany = (context: ACLContext) => async (entity: string, filter?: Record<string, unknown>) => {
  const operation = resolveOperation('deleteMany')
  return withAudit(context, entity, operation, () => context.baseAdapter.deleteMany(entity, filter))
}
