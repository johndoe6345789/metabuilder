import type { AdapterCapabilities, DBALAdapter } from '../adapter'
import type { ListOptions, ListResult } from '../../core/foundation/types'
import type { ACLContext } from './operation-runner'
import { createBulkOperations } from './bulk-operations'
import { createCrudOperations } from './crud'
import { createQueryOperations } from './queries'

export interface ACLOperations {
  create: (entity: string, data: Record<string, unknown>) => Promise<unknown>
  read: (entity: string, id: string) => Promise<unknown | null>
  update: (entity: string, id: string, data: Record<string, unknown>) => Promise<unknown>
  deleteOne: (entity: string, id: string) => Promise<boolean>
  list: (entity: string, options?: ListOptions) => Promise<ListResult<unknown>>
  findFirst: (entity: string, filter?: Record<string, unknown>) => Promise<unknown | null>
  findByField: (entity: string, field: string, value: unknown) => Promise<unknown | null>
  upsert: (
    entity: string,
    filter: Record<string, unknown>,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>
  ) => Promise<unknown>
  updateByField: (
    entity: string,
    field: string,
    value: unknown,
    data: Record<string, unknown>
  ) => Promise<unknown>
  deleteByField: (entity: string, field: string, value: unknown) => Promise<boolean>
  createMany: (entity: string, data: Record<string, unknown>[]) => Promise<number>
  updateMany: (
    entity: string,
    filter: Record<string, unknown>,
    data: Record<string, unknown>
  ) => Promise<number>
  deleteMany: (entity: string, filter?: Record<string, unknown>) => Promise<number>
  getCapabilities: () => Promise<AdapterCapabilities>
  close: () => Promise<void>
}

export const createACLOperations = ({
  baseAdapter,
  context,
}: {
  baseAdapter: DBALAdapter
  context: ACLContext
}): ACLOperations => {
  const crud = createCrudOperations(baseAdapter, context)
  const queries = createQueryOperations(baseAdapter, context)
  const bulk = createBulkOperations(baseAdapter, context)

  const getCapabilities = (): Promise<AdapterCapabilities> => baseAdapter.getCapabilities()
  const close = (): Promise<void> => baseAdapter.close()

  return {
    ...crud,
    ...queries,
    ...bulk,
    getCapabilities,
    close,
  }
}
