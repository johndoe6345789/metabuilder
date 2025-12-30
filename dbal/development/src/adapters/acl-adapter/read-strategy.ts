import type { ListOptions, ListResult } from '../../core/foundation/types'
import { enforceRowAccess, resolveOperation, withAudit } from './guards'
import type { ACLContext } from './types'

export const createReadStrategy = (context: ACLContext) => {
  const read = async (entity: string, id: string): Promise<unknown | null> => {
    return withAudit(context, entity, 'read', async () => {
      const result = await context.baseAdapter.read(entity, id)
      if (result) {
        enforceRowAccess(context, entity, 'read', result as Record<string, unknown>)
      }
      return result
    })
  }

  const list = async (entity: string, options?: ListOptions): Promise<ListResult<unknown>> => {
    return withAudit(context, entity, 'list', () => context.baseAdapter.list(entity, options))
  }

  const findFirst = async (entity: string, filter?: Record<string, unknown>): Promise<unknown | null> => {
    const operation = resolveOperation('findFirst')
    return withAudit(context, entity, operation, async () => {
      const result = await context.baseAdapter.findFirst(entity, filter)
      if (result) {
        enforceRowAccess(context, entity, operation, result as Record<string, unknown>)
      }
      return result
    })
  }

  const findByField = async (entity: string, field: string, value: unknown): Promise<unknown | null> => {
    const operation = resolveOperation('findByField')
    return withAudit(context, entity, operation, async () => {
      const result = await context.baseAdapter.findByField(entity, field, value)
      if (result) {
        enforceRowAccess(context, entity, operation, result as Record<string, unknown>)
      }
      return result
    })
  }

  return {
    read,
    list,
    findFirst,
    findByField,
  }
}
