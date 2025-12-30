import type { DBALAdapter, AdapterCapabilities } from '../../adapters/adapter'
import type { ListOptions, ListResult } from '../../core/types'
import { createConnectionManager } from './connection-manager'
import { createMessageRouter } from './message-router'
import { createOperations } from './operations'
import { createBridgeState } from './state'

export class WebSocketBridge implements DBALAdapter {
  private readonly state: ReturnType<typeof createBridgeState>
  private readonly connectionManager: ReturnType<typeof createConnectionManager>
  private readonly operations: ReturnType<typeof createOperations>

  constructor(endpoint: string, auth?: { user: unknown; session: unknown }) {
    this.state = createBridgeState(endpoint, auth)
    const messageRouter = createMessageRouter(this.state)
    this.connectionManager = createConnectionManager(this.state, messageRouter)
    this.operations = createOperations(this.state, this.connectionManager)
  }

  create(entity: string, data: Record<string, unknown>): Promise<unknown> {
    return this.operations.create(entity, data)
  }

  read(entity: string, id: string): Promise<unknown | null> {
    return this.operations.read(entity, id) as Promise<unknown | null>
  }

  update(entity: string, id: string, data: Record<string, unknown>): Promise<unknown> {
    return this.operations.update(entity, id, data)
  }

  delete(entity: string, id: string): Promise<boolean> {
    return this.operations.delete(entity, id)
  }

  list(entity: string, options?: ListOptions): Promise<ListResult<unknown>> {
    return this.operations.list(entity, options)
  }

  findFirst(entity: string, filter?: Record<string, unknown>): Promise<unknown | null> {
    return this.operations.findFirst(entity, filter) as Promise<unknown | null>
  }

  findByField(entity: string, field: string, value: unknown): Promise<unknown | null> {
    return this.operations.findByField(entity, field, value) as Promise<unknown | null>
  }

  upsert(
    entity: string,
    filter: Record<string, unknown>,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>,
  ): Promise<unknown> {
    return this.operations.upsert(entity, filter, createData, updateData)
  }

  updateByField(entity: string, field: string, value: unknown, data: Record<string, unknown>): Promise<unknown> {
    return this.operations.updateByField(entity, field, value, data)
  }

  deleteByField(entity: string, field: string, value: unknown): Promise<boolean> {
    return this.operations.deleteByField(entity, field, value)
  }

  deleteMany(entity: string, filter?: Record<string, unknown>): Promise<number> {
    return this.operations.deleteMany(entity, filter)
  }

  createMany(entity: string, data: Record<string, unknown>[]): Promise<number> {
    return this.operations.createMany(entity, data)
  }

  updateMany(entity: string, filter: Record<string, unknown>, data: Record<string, unknown>): Promise<number> {
    return this.operations.updateMany(entity, filter, data)
  }

  getCapabilities(): Promise<AdapterCapabilities> {
    return this.operations.getCapabilities()
  }

  async close(): Promise<void> {
    await this.connectionManager.close()
  }
}
