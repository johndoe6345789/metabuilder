import { enforceRowAccess, resolveOperation, withAudit } from './guards'
import type { ACLContext } from './types'

export const createWriteStrategy = (context: ACLContext) => {
  const create = async (entity: string, data: Record<string, unknown>): Promise<unknown> => {
    return withAudit(context, entity, 'create', () => context.baseAdapter.create(entity, data))
  }

  const update = async (entity: string, id: string, data: Record<string, unknown>): Promise<unknown> => {
    return withAudit(context, entity, 'update', async () => {
      const existing = await context.baseAdapter.read(entity, id)
      if (existing) {
        enforceRowAccess(context, entity, 'update', existing as Record<string, unknown>)
      }
      return context.baseAdapter.update(entity, id, data)
    })
  }

  const remove = async (entity: string, id: string): Promise<boolean> => {
    return withAudit(context, entity, 'delete', async () => {
      const existing = await context.baseAdapter.read(entity, id)
      if (existing) {
        enforceRowAccess(context, entity, 'delete', existing as Record<string, unknown>)
      }
      return context.baseAdapter.delete(entity, id)
    })
  }

  const upsert = async (
    entity: string,
    filter: Record<string, unknown>,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>,
  ): Promise<unknown> => {
    return withAudit(context, entity, 'upsert', () => {
      // Extract first key from filter as uniqueField
      const uniqueField = Object.keys(filter)[0]
      if (!uniqueField) {
        throw new Error('Filter must have at least one key')
      }
      const uniqueValue = filter[uniqueField]
      if (typeof uniqueValue !== 'string') {
        throw new Error('Unique value must be a string')
      }
      return context.baseAdapter.upsert(entity, uniqueField, uniqueValue, createData, updateData)
    })
  }

  const updateByField = async (
    entity: string,
    field: string,
    value: unknown,
    data: Record<string, unknown>,
  ): Promise<unknown> => {
    const operation = resolveOperation('updateByField')
    return withAudit(context, entity, operation, () => context.baseAdapter.updateByField(entity, field, value, data))
  }

  const deleteByField = async (entity: string, field: string, value: unknown): Promise<boolean> => {
    const operation = resolveOperation('deleteByField')
    return withAudit(context, entity, operation, () => context.baseAdapter.deleteByField(entity, field, value))
  }

  const createMany = async (entity: string, data: Record<string, unknown>[]): Promise<number> => {
    const operation = resolveOperation('createMany')
    return withAudit(context, entity, operation, () => context.baseAdapter.createMany(entity, data))
  }

  const updateMany = async (
    entity: string,
    filter: Record<string, unknown>,
    data: Record<string, unknown>,
  ): Promise<number> => {
    const operation = resolveOperation('updateMany')
    return withAudit(context, entity, operation, () => context.baseAdapter.updateMany(entity, filter, data))
  }

  const deleteMany = async (entity: string, filter?: Record<string, unknown>): Promise<number> => {
    const operation = resolveOperation('deleteMany')
    return withAudit(context, entity, operation, () => context.baseAdapter.deleteMany(entity, filter))
  }

  return {
    create,
    update,
    delete: remove,
    upsert,
    updateByField,
    deleteByField,
    createMany,
    updateMany,
    deleteMany,
  }
}
