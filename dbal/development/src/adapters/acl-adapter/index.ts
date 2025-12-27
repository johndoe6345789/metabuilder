import type { AdapterCapabilities, DBALAdapter } from '../adapter'
import type { ListOptions, ListResult } from '../../core/foundation/types'
import type { User, ACLRule } from '../acl/types'
import type { ACLContext } from './context'
import { createContext } from './context'
import { createEntity, deleteEntity, listEntities, readEntity, updateEntity } from './crud'
import {
  createMany,
  deleteByField,
  deleteMany,
  findByField,
  findFirst,
  updateByField,
  updateMany,
  upsert,
} from './bulk'

export class ACLAdapter implements DBALAdapter {
  private readonly context: ACLContext

  constructor(baseAdapter: DBALAdapter, user: User, options?: { rules?: ACLRule[]; auditLog?: boolean }) {
    this.context = createContext(baseAdapter, user, options)
  }

  async create(entity: string, data: Record<string, unknown>): Promise<unknown> {
    return createEntity(this.context)(entity, data)
  }

  async read(entity: string, id: string): Promise<unknown | null> {
    return readEntity(this.context)(entity, id)
  }

  async update(entity: string, id: string, data: Record<string, unknown>): Promise<unknown> {
    return updateEntity(this.context)(entity, id, data)
  }

  async delete(entity: string, id: string): Promise<boolean> {
    return deleteEntity(this.context)(entity, id)
  }

  async list(entity: string, options?: ListOptions): Promise<ListResult<unknown>> {
    return listEntities(this.context)(entity, options)
  }

  async findFirst(entity: string, filter?: Record<string, unknown>): Promise<unknown | null> {
    return findFirst(this.context)(entity, filter)
  }

  async findByField(entity: string, field: string, value: unknown): Promise<unknown | null> {
    return findByField(this.context)(entity, field, value)
  }

  async upsert(
    entity: string,
    filter: Record<string, unknown>,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>,
  ): Promise<unknown> {
    return upsert(this.context)(entity, filter, createData, updateData)
  }

  async updateByField(entity: string, field: string, value: unknown, data: Record<string, unknown>): Promise<unknown> {
    return updateByField(this.context)(entity, field, value, data)
  }

  async deleteByField(entity: string, field: string, value: unknown): Promise<boolean> {
    return deleteByField(this.context)(entity, field, value)
  }

  async createMany(entity: string, data: Record<string, unknown>[]): Promise<number> {
    return createMany(this.context)(entity, data)
  }

  async updateMany(entity: string, filter: Record<string, unknown>, data: Record<string, unknown>): Promise<number> {
    return updateMany(this.context)(entity, filter, data)
  }

  async deleteMany(entity: string, filter?: Record<string, unknown>): Promise<number> {
    return deleteMany(this.context)(entity, filter)
  }

  async getCapabilities(): Promise<AdapterCapabilities> {
    return this.context.baseAdapter.getCapabilities()
  }

  async close(): Promise<void> {
    await this.context.baseAdapter.close()
  }
}

export type { User, ACLRule } from './acl/types'
export { defaultACLRules } from './acl/default-rules'
