import type { AdapterCapabilities } from '../../adapters/adapter'
import type { ListOptions, ListResult } from '../../core/types'
import type { BridgeState } from './state'
import { rpcCall } from './rpc'

export const createOperations = (state: BridgeState) => ({
  create: (entity: string, data: Record<string, unknown>) => rpcCall(state, 'create', entity, data),
  read: (entity: string, id: string) => rpcCall(state, 'read', entity, id),
  update: (entity: string, id: string, data: Record<string, unknown>) => rpcCall(state, 'update', entity, id, data),
  delete: (entity: string, id: string) => rpcCall(state, 'delete', entity, id) as Promise<boolean>,
  list: (entity: string, options?: ListOptions) => rpcCall(state, 'list', entity, options) as Promise<ListResult<unknown>>,
  findFirst: (entity: string, filter?: Record<string, unknown>) => rpcCall(state, 'findFirst', entity, filter),
  findByField: (entity: string, field: string, value: unknown) => rpcCall(state, 'findByField', entity, field, value),
  upsert: (
    entity: string,
    filter: Record<string, unknown>,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>,
  ) => rpcCall(state, 'upsert', entity, filter, createData, updateData),
  updateByField: (entity: string, field: string, value: unknown, data: Record<string, unknown>) =>
    rpcCall(state, 'updateByField', entity, field, value, data),
  deleteByField: (entity: string, field: string, value: unknown) =>
    rpcCall(state, 'deleteByField', entity, field, value) as Promise<boolean>,
  deleteMany: (entity: string, filter?: Record<string, unknown>) =>
    rpcCall(state, 'deleteMany', entity, filter) as Promise<number>,
  createMany: (entity: string, data: Record<string, unknown>[]) =>
    rpcCall(state, 'createMany', entity, data) as Promise<number>,
  updateMany: (entity: string, filter: Record<string, unknown>, data: Record<string, unknown>) =>
    rpcCall(state, 'updateMany', entity, filter, data) as Promise<number>,
  getCapabilities: () => rpcCall(state, 'getCapabilities') as Promise<AdapterCapabilities>,
})
