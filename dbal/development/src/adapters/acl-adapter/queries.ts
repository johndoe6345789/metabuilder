import type { ListOptions, ListResult } from '../../core/foundation/types'
import type { DBALAdapter } from '../adapter'
import type { ACLContext } from './operation-runner'
import { deriveOperation, guardRowLevel, runWithAccess } from './operation-runner'

export const createQueryOperations = (
  baseAdapter: DBALAdapter,
  context: ACLContext
) => {
  const list = (entity: string, options?: ListOptions): Promise<ListResult<unknown>> =>
    runWithAccess(context, entity, 'list', () => baseAdapter.list(entity, options))

  const findFirst = (
    entity: string,
    filter?: Record<string, unknown>
  ): Promise<unknown | null> => {
    const operation = deriveOperation('findFirst')
    return runWithAccess(
      context,
      entity,
      operation,
      () => baseAdapter.findFirst(entity, filter),
      guardRowLevel(entity, operation, context.user, context.rules, context.log)
    )
  }

  const findByField = (
    entity: string,
    field: string,
    value: unknown
  ): Promise<unknown | null> => {
    const operation = deriveOperation('findByField')
    return runWithAccess(
      context,
      entity,
      operation,
      () => baseAdapter.findByField(entity, field, value),
      guardRowLevel(entity, operation, context.user, context.rules, context.log)
    )
  }

  return { list, findFirst, findByField }
}
