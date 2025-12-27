import type { DBALAdapter } from '../adapter'
import type { ACLContext } from './operation-runner'
import { deriveOperation, runWithAccess } from './operation-runner'

export const createBulkOperations = (
  baseAdapter: DBALAdapter,
  context: ACLContext
) => {
  const upsert = async (
    entity: string,
    filter: Record<string, unknown>,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>
  ): Promise<unknown> => {
    await runWithAccess(context, entity, 'create', async () => undefined)
    await runWithAccess(context, entity, 'update', async () => undefined)

    return runWithAccess(context, entity, 'upsert', () =>
      baseAdapter.upsert(entity, filter, createData, updateData)
    )
  }

  const updateByField = (
    entity: string,
    field: string,
    value: unknown,
    data: Record<string, unknown>
  ): Promise<unknown> => {
    const operation = deriveOperation('updateByField')
    return runWithAccess(context, entity, operation, () =>
      baseAdapter.updateByField(entity, field, value, data)
    )
  }

  const deleteByField = (entity: string, field: string, value: unknown): Promise<boolean> => {
    const operation = deriveOperation('deleteByField')
    return runWithAccess(context, entity, operation, () =>
      baseAdapter.deleteByField(entity, field, value)
    )
  }

  const createMany = (
    entity: string,
    data: Record<string, unknown>[]
  ): Promise<number> => {
    const operation = deriveOperation('createMany')
    return runWithAccess(context, entity, operation, () =>
      baseAdapter.createMany(entity, data)
    )
  }

  const updateMany = (
    entity: string,
    filter: Record<string, unknown>,
    data: Record<string, unknown>
  ): Promise<number> => {
    const operation = deriveOperation('updateMany')
    return runWithAccess(context, entity, operation, () =>
      baseAdapter.updateMany(entity, filter, data)
    )
  }

  const deleteMany = (entity: string, filter?: Record<string, unknown>): Promise<number> => {
    const operation = deriveOperation('deleteMany')
    return runWithAccess(context, entity, operation, () =>
      baseAdapter.deleteMany(entity, filter)
    )
  }

  return {
    upsert,
    updateByField,
    deleteByField,
    createMany,
    updateMany,
    deleteMany,
  }
}
