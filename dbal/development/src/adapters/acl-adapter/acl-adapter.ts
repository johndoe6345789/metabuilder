import type { AdapterCapabilities, DBALAdapter } from '../adapter'
import type { ListOptions, ListResult } from '../../core/foundation/types'
import { createContext } from './context'
import { createReadStrategy } from './read-strategy'
import { createWriteStrategy } from './write-strategy'
import type { ACLAdapterOptions, ACLContext, ACLRule, User } from './types'

export class ACLAdapter implements DBALAdapter {
  private readonly context: ACLContext
  private readonly readStrategy: ReturnType<typeof createReadStrategy>
  private readonly writeStrategy: ReturnType<typeof createWriteStrategy>

  constructor(baseAdapter: DBALAdapter, user: User, options?: ACLAdapterOptions) {
    this.context = createContext(baseAdapter, user, options)
    this.readStrategy = createReadStrategy(this.context)
    this.writeStrategy = createWriteStrategy(this.context)
  }

  async create(entity: string, data: Record<string, unknown>): Promise<unknown> {
    return this.writeStrategy.create(entity, data)
  }

  async read(entity: string, id: string): Promise<unknown | null> {
    return this.readStrategy.read(entity, id)
  }

  async update(entity: string, id: string, data: Record<string, unknown>): Promise<unknown> {
    return this.writeStrategy.update(entity, id, data)
  }

  async delete(entity: string, id: string): Promise<boolean> {
    return this.writeStrategy.delete(entity, id)
  }

  async list(entity: string, options?: ListOptions): Promise<ListResult<unknown>> {
    return this.readStrategy.list(entity, options)
  }

  async findFirst(entity: string, filter?: Record<string, unknown>): Promise<unknown | null> {
    return this.readStrategy.findFirst(entity, filter)
  }

  async findByField(entity: string, field: string, value: unknown): Promise<unknown | null> {
    return this.readStrategy.findByField(entity, field, value)
  }

  async upsert(
    entity: string,
    filter: Record<string, unknown>,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>,
  ): Promise<unknown> {
    return this.writeStrategy.upsert(entity, filter, createData, updateData)
  }

  async updateByField(entity: string, field: string, value: unknown, data: Record<string, unknown>): Promise<unknown> {
    return this.writeStrategy.updateByField(entity, field, value, data)
  }

  async deleteByField(entity: string, field: string, value: unknown): Promise<boolean> {
    return this.writeStrategy.deleteByField(entity, field, value)
  }

  async createMany(entity: string, data: Record<string, unknown>[]): Promise<number> {
    return this.writeStrategy.createMany(entity, data)
  }

  async updateMany(entity: string, filter: Record<string, unknown>, data: Record<string, unknown>): Promise<number> {
    return this.writeStrategy.updateMany(entity, filter, data)
  }

  async deleteMany(entity: string, filter?: Record<string, unknown>): Promise<number> {
    return this.writeStrategy.deleteMany(entity, filter)
  }

  async getCapabilities(): Promise<AdapterCapabilities> {
    return this.context.baseAdapter.getCapabilities()
  }

  async close(): Promise<void> {
    await this.context.baseAdapter.close()
  }
}

export type { ACLAdapterOptions, ACLContext, ACLRule, User }
export { defaultACLRules } from '../acl/default-rules'
