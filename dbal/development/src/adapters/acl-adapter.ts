/**
 * @file acl-adapter.ts
 * @description ACL adapter that wraps a base adapter with access control
 */

import type { DBALAdapter, AdapterCapabilities } from './adapter'
import type { ListOptions, ListResult } from '../core/foundation/types'
import type { User, ACLRule } from './acl/types'
import { resolvePermissionOperation } from './acl/resolve-permission-operation'
import { checkPermission } from './acl/check-permission'
import { checkRowLevelAccess } from './acl/check-row-level-access'
import { logAudit } from './acl/audit-logger'
import { defaultACLRules } from './acl/default-rules'

export class ACLAdapter implements DBALAdapter {
  private baseAdapter: DBALAdapter
  private user: User
  private rules: ACLRule[]
  private auditLog: boolean

  constructor(
    baseAdapter: DBALAdapter,
    user: User,
    options?: {
      rules?: ACLRule[]
      auditLog?: boolean
    }
  ) {
    this.baseAdapter = baseAdapter
    this.user = user
    this.rules = options?.rules || defaultACLRules
    this.auditLog = options?.auditLog ?? true
  }

  private log(entity: string, operation: string, success: boolean, message?: string): void {
    if (this.auditLog) {
      logAudit(entity, operation, success, this.user, message)
    }
  }

  async create(entity: string, data: Record<string, unknown>): Promise<unknown> {
    const operation = 'create'
    checkPermission(entity, operation, this.user, this.rules, this.log.bind(this))
    
    try {
      const result = await this.baseAdapter.create(entity, data)
      this.log(entity, operation, true)
      return result
    } catch (error) {
      this.log(entity, operation, false, (error as Error).message)
      throw error
    }
  }

  async read(entity: string, id: string): Promise<unknown | null> {
    const operation = 'read'
    checkPermission(entity, operation, this.user, this.rules, this.log.bind(this))
    
    try {
      const result = await this.baseAdapter.read(entity, id)
      if (result) {
        checkRowLevelAccess(entity, operation, result as Record<string, unknown>, this.user, this.rules, this.log.bind(this))
      }
      this.log(entity, operation, true)
      return result
    } catch (error) {
      this.log(entity, operation, false, (error as Error).message)
      throw error
    }
  }

  async update(entity: string, id: string, data: Record<string, unknown>): Promise<unknown> {
    const operation = 'update'
    checkPermission(entity, operation, this.user, this.rules, this.log.bind(this))
    
    const existing = await this.baseAdapter.read(entity, id)
    if (existing) {
      checkRowLevelAccess(entity, operation, existing as Record<string, unknown>, this.user, this.rules, this.log.bind(this))
    }
    
    try {
      const result = await this.baseAdapter.update(entity, id, data)
      this.log(entity, operation, true)
      return result
    } catch (error) {
      this.log(entity, operation, false, (error as Error).message)
      throw error
    }
  }

  async delete(entity: string, id: string): Promise<boolean> {
    const operation = 'delete'
    checkPermission(entity, operation, this.user, this.rules, this.log.bind(this))
    
    const existing = await this.baseAdapter.read(entity, id)
    if (existing) {
      checkRowLevelAccess(entity, operation, existing as Record<string, unknown>, this.user, this.rules, this.log.bind(this))
    }
    
    try {
      const result = await this.baseAdapter.delete(entity, id)
      this.log(entity, operation, true)
      return result
    } catch (error) {
      this.log(entity, operation, false, (error as Error).message)
      throw error
    }
  }

  async list(entity: string, options?: ListOptions): Promise<ListResult<unknown>> {
    const operation = 'list'
    checkPermission(entity, operation, this.user, this.rules, this.log.bind(this))
    
    try {
      const result = await this.baseAdapter.list(entity, options)
      this.log(entity, operation, true)
      return result
    } catch (error) {
      this.log(entity, operation, false, (error as Error).message)
      throw error
    }
  }

  async findFirst(entity: string, filter?: Record<string, unknown>): Promise<unknown | null> {
    const resolvedOperation = resolvePermissionOperation('findFirst')
    checkPermission(entity, resolvedOperation, this.user, this.rules, this.log.bind(this))
    
    try {
      const result = await this.baseAdapter.findFirst(entity, filter)
      if (result) {
        checkRowLevelAccess(entity, resolvedOperation, result as Record<string, unknown>, this.user, this.rules, this.log.bind(this))
      }
      this.log(entity, 'findFirst', true)
      return result
    } catch (error) {
      this.log(entity, 'findFirst', false, (error as Error).message)
      throw error
    }
  }

  async findByField(entity: string, field: string, value: unknown): Promise<unknown | null> {
    const resolvedOperation = resolvePermissionOperation('findByField')
    checkPermission(entity, resolvedOperation, this.user, this.rules, this.log.bind(this))
    
    try {
      const result = await this.baseAdapter.findByField(entity, field, value)
      if (result) {
        checkRowLevelAccess(entity, resolvedOperation, result as Record<string, unknown>, this.user, this.rules, this.log.bind(this))
      }
      this.log(entity, 'findByField', true)
      return result
    } catch (error) {
      this.log(entity, 'findByField', false, (error as Error).message)
      throw error
    }
  }

  async upsert(
    entity: string,
    filter: Record<string, unknown>,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>
  ): Promise<unknown> {
    checkPermission(entity, 'create', this.user, this.rules, this.log.bind(this))
    checkPermission(entity, 'update', this.user, this.rules, this.log.bind(this))
    
    try {
      const result = await this.baseAdapter.upsert(entity, filter, createData, updateData)
      this.log(entity, 'upsert', true)
      return result
    } catch (error) {
      this.log(entity, 'upsert', false, (error as Error).message)
      throw error
    }
  }

  async updateByField(entity: string, field: string, value: unknown, data: Record<string, unknown>): Promise<unknown> {
    const resolvedOperation = resolvePermissionOperation('updateByField')
    checkPermission(entity, resolvedOperation, this.user, this.rules, this.log.bind(this))
    
    try {
      const result = await this.baseAdapter.updateByField(entity, field, value, data)
      this.log(entity, 'updateByField', true)
      return result
    } catch (error) {
      this.log(entity, 'updateByField', false, (error as Error).message)
      throw error
    }
  }

  async deleteByField(entity: string, field: string, value: unknown): Promise<boolean> {
    const resolvedOperation = resolvePermissionOperation('deleteByField')
    checkPermission(entity, resolvedOperation, this.user, this.rules, this.log.bind(this))
    
    try {
      const result = await this.baseAdapter.deleteByField(entity, field, value)
      this.log(entity, 'deleteByField', true)
      return result
    } catch (error) {
      this.log(entity, 'deleteByField', false, (error as Error).message)
      throw error
    }
  }

  async createMany(entity: string, data: Record<string, unknown>[]): Promise<number> {
    const resolvedOperation = resolvePermissionOperation('createMany')
    checkPermission(entity, resolvedOperation, this.user, this.rules, this.log.bind(this))
    
    try {
      const result = await this.baseAdapter.createMany(entity, data)
      this.log(entity, 'createMany', true)
      return result
    } catch (error) {
      this.log(entity, 'createMany', false, (error as Error).message)
      throw error
    }
  }

  async updateMany(entity: string, filter: Record<string, unknown>, data: Record<string, unknown>): Promise<number> {
    const resolvedOperation = resolvePermissionOperation('updateMany')
    checkPermission(entity, resolvedOperation, this.user, this.rules, this.log.bind(this))
    
    try {
      const result = await this.baseAdapter.updateMany(entity, filter, data)
      this.log(entity, 'updateMany', true)
      return result
    } catch (error) {
      this.log(entity, 'updateMany', false, (error as Error).message)
      throw error
    }
  }

  async deleteMany(entity: string, filter?: Record<string, unknown>): Promise<number> {
    const resolvedOperation = resolvePermissionOperation('deleteMany')
    checkPermission(entity, resolvedOperation, this.user, this.rules, this.log.bind(this))
    
    try {
      const result = await this.baseAdapter.deleteMany(entity, filter)
      this.log(entity, 'deleteMany', true)
      return result
    } catch (error) {
      this.log(entity, 'deleteMany', false, (error as Error).message)
      throw error
    }
  }

  async getCapabilities(): Promise<AdapterCapabilities> {
    return this.baseAdapter.getCapabilities()
  }

  async close(): Promise<void> {
    await this.baseAdapter.close()
  }
}

// Re-export types for convenience
export type { User, ACLRule } from './acl/types'
export { defaultACLRules } from './acl/default-rules'
