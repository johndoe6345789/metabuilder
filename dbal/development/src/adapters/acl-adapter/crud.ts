import type { DBALAdapter } from '../adapter'
import type { ACLContext } from './operation-runner'
import { guardRowLevel, runWithAccess } from './operation-runner'

export const createCrudOperations = (
  baseAdapter: DBALAdapter,
  context: ACLContext
) => {
  const create = (entity: string, data: Record<string, unknown>): Promise<unknown> =>
    runWithAccess(context, entity, 'create', () => baseAdapter.create(entity, data))

  const read = (entity: string, id: string): Promise<unknown | null> =>
    runWithAccess(
      context,
      entity,
      'read',
      () => baseAdapter.read(entity, id),
      guardRowLevel(entity, 'read', context.user, context.rules, context.log)
    )

  const update = async (
    entity: string,
    id: string,
    data: Record<string, unknown>
  ): Promise<unknown> => {
    const existing = await baseAdapter.read(entity, id)

    if (existing) {
      await guardRowLevel(entity, 'update', context.user, context.rules, context.log)(existing)
    }

    return runWithAccess(context, entity, 'update', () =>
      baseAdapter.update(entity, id, data)
    )
  }

  const deleteOne = async (entity: string, id: string): Promise<boolean> => {
    const existing = await baseAdapter.read(entity, id)

    if (existing) {
      await guardRowLevel(entity, 'delete', context.user, context.rules, context.log)(existing)
    }

    return runWithAccess(context, entity, 'delete', () => baseAdapter.delete(entity, id))
  }

  return { create, read, update, deleteOne }
}
