import type { AdapterCapabilities } from '../../adapters/adapter'
import type { ListOptions, ListResult } from '../../core/types'
import type { ConnectionManager } from './connection-manager'
import type { BridgeState } from './state'
import { rpcCall } from './rpc'

export const createOperations = (state: BridgeState, connectionManager: ConnectionManager) => ({
  create: (entity: string, data: Record<string, unknown>) => rpcCall(state, connectionManager, 'create', entity, data),
  read: (entity: string, id: string) => rpcCall(state, connectionManager, 'read', entity, id),
  update: (entity: string, id: string, data: Record<string, unknown>) =>
    rpcCall(state, connectionManager, 'update', entity, id, data),
  delete: (entity: string, id: string) => rpcCall(state, connectionManager, 'delete', entity, id) as Promise<boolean>,
  list: (entity: string, options?: ListOptions) =>
    rpcCall(state, connectionManager, 'list', entity, options) as Promise<ListResult<unknown>>,
  findFirst: (entity: string, filter?: Record<string, unknown>) =>
    rpcCall(state, connectionManager, 'findFirst', entity, filter),
  findByField: (entity: string, field: string, value: unknown) =>
    rpcCall(state, connectionManager, 'findByField', entity, field, value),
  upsert: (
    entity: string,
    filter: Record<string, unknown>,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>,
  ) => rpcCall(state, connectionManager, 'upsert', entity, filter, createData, updateData),
  updateByField: (entity: string, field: string, value: unknown, data: Record<string, unknown>) =>
    rpcCall(state, connectionManager, 'updateByField', entity, field, value, data),
  deleteByField: (entity: string, field: string, value: unknown) =>
    rpcCall(state, connectionManager, 'deleteByField', entity, field, value) as Promise<boolean>,
  deleteMany: (entity: string, filter?: Record<string, unknown>) =>
    rpcCall(state, connectionManager, 'deleteMany', entity, filter) as Promise<number>,
  createMany: (entity: string, data: Record<string, unknown>[]) =>
    rpcCall(state, connectionManager, 'createMany', entity, data) as Promise<number>,
  updateMany: (entity: string, filter: Record<string, unknown>, data: Record<string, unknown>) =>
    rpcCall(state, connectionManager, 'updateMany', entity, filter, data) as Promise<number>,
  getCapabilities: () => rpcCall(state, connectionManager, 'getCapabilities') as Promise<AdapterCapabilities>,
})
