import type { DBALAdapter, AdapterCapabilities } from '../adapters/adapter'
import type { ListOptions, ListResult } from '../core/foundation/types'
import { DBALError } from '../core/foundation/errors'

interface User {
  id: string
  username: string
  role: 'user' | 'admin' | 'god' | 'supergod'
}

interface ACLRule {
  entity: string
  roles: string[]
  operations: string[]
  rowLevelFilter?: (user: User, data: Record<string, unknown>) => boolean
}

const defaultACLRules: ACLRule[] = [
  {
    entity: 'User',
    roles: ['user'],
    operations: ['read', 'update'],
    rowLevelFilter: (user, data) => data.id === user.id
  },
  {
    entity: 'User',
    roles: ['admin', 'god', 'supergod'],
    operations: ['create', 'read', 'update', 'delete', 'list']
  },
  {
    entity: 'PageView',
    roles: ['user', 'admin', 'god', 'supergod'],
    operations: ['read', 'list']
  },
  {
    entity: 'PageView',
    roles: ['god', 'supergod'],
    operations: ['create', 'update', 'delete']
  },
  {
    entity: 'ComponentHierarchy',
    roles: ['god', 'supergod'],
    operations: ['create', 'read', 'update', 'delete', 'list']
  },
  {
    entity: 'Workflow',
    roles: ['god', 'supergod'],
    operations: ['create', 'read', 'update', 'delete', 'list']
  },
  {
    entity: 'LuaScript',
    roles: ['god', 'supergod'],
    operations: ['create', 'read', 'update', 'delete', 'list']
  },
  {
    entity: 'Package',
    roles: ['admin', 'god', 'supergod'],
    operations: ['read', 'list']
  },
  {
    entity: 'Package',
    roles: ['god', 'supergod'],
    operations: ['create', 'update', 'delete']
  },
]

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

  private resolvePermissionOperation(operation: string): string {
    switch (operation) {
      case 'findFirst':
      case 'findByField':
        return 'read'
      case 'createMany':
        return 'create'
      case 'updateByField':
      case 'updateMany':
        return 'update'
      case 'deleteByField':
      case 'deleteMany':
        return 'delete'
      default:
        return operation
    }
  }

  private checkPermission(entity: string, operation: string): void {
    const matchingRules = this.rules.filter(rule => 
      rule.entity === entity && 
      rule.roles.includes(this.user.role) &&
      rule.operations.includes(operation)
    )

    if (matchingRules.length === 0) {
      if (this.auditLog) {
        this.logAudit(entity, operation, false, 'Permission denied')
      }
      throw DBALError.forbidden(
        `User ${this.user.username} (${this.user.role}) cannot ${operation} ${entity}`
      )
    }
  }

  private checkRowLevelAccess(
    entity: string, 
    operation: string, 
    data: Record<string, unknown>
  ): void {
    const matchingRules = this.rules.filter(rule => 
      rule.entity === entity && 
      rule.roles.includes(this.user.role) &&
      rule.operations.includes(operation) &&
      rule.rowLevelFilter
    )

    for (const rule of matchingRules) {
      if (rule.rowLevelFilter && !rule.rowLevelFilter(this.user, data)) {
        if (this.auditLog) {
          this.logAudit(entity, operation, false, 'Row-level access denied')
        }
        throw DBALError.forbidden(
          `Row-level access denied for ${entity}`
        )
      }
    }
  }

  private logAudit(
    entity: string,
    operation: string,
    success: boolean,
    message?: string
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      user: this.user.username,
      userId: this.user.id,
      role: this.user.role,
      entity,
      operation,
      success,
      message
    }
    console.log('[DBAL Audit]', JSON.stringify(logEntry))
  }

  async create(entity: string, data: Record<string, unknown>): Promise<unknown> {
    this.checkPermission(entity, 'create')
    
    try {
      const result = await this.baseAdapter.create(entity, data)
      if (this.auditLog) {
        this.logAudit(entity, 'create', true)
      }
      return result
    } catch (error) {
      if (this.auditLog) {
        this.logAudit(entity, 'create', false, error instanceof Error ? error.message : 'Unknown error')
      }
      throw error
    }
  }

  async read(entity: string, id: string): Promise<unknown | null> {
    this.checkPermission(entity, 'read')
    
    try {
      const result = await this.baseAdapter.read(entity, id)
      
      if (result) {
        this.checkRowLevelAccess(entity, 'read', result as Record<string, unknown>)
      }
      
      if (this.auditLog) {
        this.logAudit(entity, 'read', true)
      }
      return result
    } catch (error) {
      if (this.auditLog) {
        this.logAudit(entity, 'read', false, error instanceof Error ? error.message : 'Unknown error')
      }
      throw error
    }
  }

  async update(entity: string, id: string, data: Record<string, unknown>): Promise<unknown> {
    this.checkPermission(entity, 'update')
    
    const existing = await this.baseAdapter.read(entity, id)
    if (existing) {
      this.checkRowLevelAccess(entity, 'update', existing as Record<string, unknown>)
    }
    
    try {
      const result = await this.baseAdapter.update(entity, id, data)
      if (this.auditLog) {
        this.logAudit(entity, 'update', true)
      }
      return result
    } catch (error) {
      if (this.auditLog) {
        this.logAudit(entity, 'update', false, error instanceof Error ? error.message : 'Unknown error')
      }
      throw error
    }
  }

  async delete(entity: string, id: string): Promise<boolean> {
    this.checkPermission(entity, 'delete')
    
    const existing = await this.baseAdapter.read(entity, id)
    if (existing) {
      this.checkRowLevelAccess(entity, 'delete', existing as Record<string, unknown>)
    }
    
    try {
      const result = await this.baseAdapter.delete(entity, id)
      if (this.auditLog) {
        this.logAudit(entity, 'delete', true)
      }
      return result
    } catch (error) {
      if (this.auditLog) {
        this.logAudit(entity, 'delete', false, error instanceof Error ? error.message : 'Unknown error')
      }
      throw error
    }
  }

  async list(entity: string, options?: ListOptions): Promise<ListResult<unknown>> {
    this.checkPermission(entity, 'list')
    
    try {
      const result = await this.baseAdapter.list(entity, options)
      if (this.auditLog) {
        this.logAudit(entity, 'list', true)
      }
      return result
    } catch (error) {
      if (this.auditLog) {
        this.logAudit(entity, 'list', false, error instanceof Error ? error.message : 'Unknown error')
      }
      throw error
    }
  }

  async findFirst(entity: string, filter?: Record<string, unknown>): Promise<unknown | null> {
    const permissionOperation = this.resolvePermissionOperation('findFirst')
    this.checkPermission(entity, permissionOperation)

    try {
      const result = await this.baseAdapter.findFirst(entity, filter)
      if (result) {
        this.checkRowLevelAccess(entity, permissionOperation, result as Record<string, unknown>)
      }
      if (this.auditLog) {
        this.logAudit(entity, 'findFirst', true)
      }
      return result
    } catch (error) {
      if (this.auditLog) {
        this.logAudit(entity, 'findFirst', false, error instanceof Error ? error.message : 'Unknown error')
      }
      throw error
    }
  }

  async findByField(entity: string, field: string, value: unknown): Promise<unknown | null> {
    const permissionOperation = this.resolvePermissionOperation('findByField')
    this.checkPermission(entity, permissionOperation)

    try {
      const result = await this.baseAdapter.findByField(entity, field, value)
      if (result) {
        this.checkRowLevelAccess(entity, permissionOperation, result as Record<string, unknown>)
      }
      if (this.auditLog) {
        this.logAudit(entity, 'findByField', true)
      }
      return result
    } catch (error) {
      if (this.auditLog) {
        this.logAudit(entity, 'findByField', false, error instanceof Error ? error.message : 'Unknown error')
      }
      throw error
    }
  }

  async upsert(
    entity: string,
    uniqueField: string,
    uniqueValue: unknown,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>
  ): Promise<unknown> {
    try {
      const existing = await this.baseAdapter.findByField(entity, uniqueField, uniqueValue)
      if (existing) {
        this.checkPermission(entity, 'update')
        this.checkRowLevelAccess(entity, 'update', existing as Record<string, unknown>)
      } else {
        this.checkPermission(entity, 'create')
      }

      const result = await this.baseAdapter.upsert(entity, uniqueField, uniqueValue, createData, updateData)
      if (this.auditLog) {
        this.logAudit(entity, 'upsert', true)
      }
      return result
    } catch (error) {
      if (this.auditLog) {
        this.logAudit(entity, 'upsert', false, error instanceof Error ? error.message : 'Unknown error')
      }
      throw error
    }
  }

  async updateByField(entity: string, field: string, value: unknown, data: Record<string, unknown>): Promise<unknown> {
    const permissionOperation = this.resolvePermissionOperation('updateByField')
    this.checkPermission(entity, permissionOperation)

    const existing = await this.baseAdapter.findByField(entity, field, value)
    if (existing) {
      this.checkRowLevelAccess(entity, permissionOperation, existing as Record<string, unknown>)
    }

    try {
      const result = await this.baseAdapter.updateByField(entity, field, value, data)
      if (this.auditLog) {
        this.logAudit(entity, 'updateByField', true)
      }
      return result
    } catch (error) {
      if (this.auditLog) {
        this.logAudit(entity, 'updateByField', false, error instanceof Error ? error.message : 'Unknown error')
      }
      throw error
    }
  }

  async deleteByField(entity: string, field: string, value: unknown): Promise<boolean> {
    const permissionOperation = this.resolvePermissionOperation('deleteByField')
    this.checkPermission(entity, permissionOperation)

    const existing = await this.baseAdapter.findByField(entity, field, value)
    if (existing) {
      this.checkRowLevelAccess(entity, permissionOperation, existing as Record<string, unknown>)
    }

    try {
      const result = await this.baseAdapter.deleteByField(entity, field, value)
      if (this.auditLog) {
        this.logAudit(entity, 'deleteByField', true)
      }
      return result
    } catch (error) {
      if (this.auditLog) {
        this.logAudit(entity, 'deleteByField', false, error instanceof Error ? error.message : 'Unknown error')
      }
      throw error
    }
  }

  async createMany(entity: string, data: Record<string, unknown>[]): Promise<number> {
    const permissionOperation = this.resolvePermissionOperation('createMany')
    this.checkPermission(entity, permissionOperation)

    try {
      const result = await this.baseAdapter.createMany(entity, data)
      if (this.auditLog) {
        this.logAudit(entity, 'createMany', true)
      }
      return result
    } catch (error) {
      if (this.auditLog) {
        this.logAudit(entity, 'createMany', false, error instanceof Error ? error.message : 'Unknown error')
      }
      throw error
    }
  }

  async updateMany(entity: string, filter: Record<string, unknown>, data: Record<string, unknown>): Promise<number> {
    const permissionOperation = this.resolvePermissionOperation('updateMany')
    this.checkPermission(entity, permissionOperation)

    const listResult = await this.baseAdapter.list(entity, { filter })
    for (const item of listResult.data) {
      this.checkRowLevelAccess(entity, permissionOperation, item as Record<string, unknown>)
    }

    try {
      const result = await this.baseAdapter.updateMany(entity, filter, data)
      if (this.auditLog) {
        this.logAudit(entity, 'updateMany', true)
      }
      return result
    } catch (error) {
      if (this.auditLog) {
        this.logAudit(entity, 'updateMany', false, error instanceof Error ? error.message : 'Unknown error')
      }
      throw error
    }
  }

  async deleteMany(entity: string, filter?: Record<string, unknown>): Promise<number> {
    const permissionOperation = this.resolvePermissionOperation('deleteMany')
    this.checkPermission(entity, permissionOperation)

    const listResult = await this.baseAdapter.list(entity, { filter })
    for (const item of listResult.data) {
      this.checkRowLevelAccess(entity, permissionOperation, item as Record<string, unknown>)
    }

    try {
      const result = await this.baseAdapter.deleteMany(entity, filter)
      if (this.auditLog) {
        this.logAudit(entity, 'deleteMany', true)
      }
      return result
    } catch (error) {
      if (this.auditLog) {
        this.logAudit(entity, 'deleteMany', false, error instanceof Error ? error.message : 'Unknown error')
      }
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
