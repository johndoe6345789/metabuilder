/**
 * @file acl-adapter.ts
 * @description ACL adapter that wraps a base adapter with access control
 */

import type { DBALAdapter } from '../adapter'
import type { ListOptions, ListResult } from '../../core/foundation/types'
import type { User, ACLRule } from '../acl/types'
import { defaultACLRules } from '../acl/default-rules'
import { createAuditLogger } from './logger'
import { ACLContext } from './operation-runner'
import { createACLOperations, ACLOperations } from './operations'

export class ACLAdapter implements DBALAdapter {
  private readonly operations: ACLOperations

  constructor(
    baseAdapter: DBALAdapter,
    user: User,
    options?: {
      rules?: ACLRule[]
      auditLog?: boolean
    }
  ) {
    const context: ACLContext = {
      user,
      rules: options?.rules || defaultACLRules,
      log: createAuditLogger(user, options?.auditLog ?? true),
    }

    this.operations = createACLOperations({ baseAdapter, context })
  }

  create(entity: string, data: Record<string, unknown>): Promise<unknown> {
    return this.operations.create(entity, data)
  }

  read(entity: string, id: string): Promise<unknown | null> {
    return this.operations.read(entity, id)
  }

  update(entity: string, id: string, data: Record<string, unknown>): Promise<unknown> {
    return this.operations.update(entity, id, data)
  }

  delete(entity: string, id: string): Promise<boolean> {
    return this.operations.deleteOne(entity, id)
  }

  list(entity: string, options?: ListOptions): Promise<ListResult<unknown>> {
    return this.operations.list(entity, options)
  }

  findFirst(entity: string, filter?: Record<string, unknown>): Promise<unknown | null> {
    return this.operations.findFirst(entity, filter)
  }

  findByField(entity: string, field: string, value: unknown): Promise<unknown | null> {
    return this.operations.findByField(entity, field, value)
  }

  upsert(
    entity: string,
    filter: Record<string, unknown>,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>
  ): Promise<unknown> {
    return this.operations.upsert(entity, filter, createData, updateData)
  }

  updateByField(
    entity: string,
    field: string,
    value: unknown,
    data: Record<string, unknown>
  ): Promise<unknown> {
    return this.operations.updateByField(entity, field, value, data)
  }

  deleteByField(entity: string, field: string, value: unknown): Promise<boolean> {
    return this.operations.deleteByField(entity, field, value)
  }

  createMany(entity: string, data: Record<string, unknown>[]): Promise<number> {
    return this.operations.createMany(entity, data)
  }

  updateMany(
    entity: string,
    filter: Record<string, unknown>,
    data: Record<string, unknown>
  ): Promise<number> {
    return this.operations.updateMany(entity, filter, data)
  }

  deleteMany(entity: string, filter?: Record<string, unknown>): Promise<number> {
    return this.operations.deleteMany(entity, filter)
  }

  getCapabilities() {
    return this.operations.getCapabilities()
  }

  close(): Promise<void> {
    return this.operations.close()
  }
}

export type { User, ACLRule } from '../acl/types'
export { defaultACLRules } from '../acl/default-rules'
