import type { DBALAdapter, AdapterCapabilities } from '../adapters/adapter'
import type { ListOptions, ListResult } from '../core/types'
import { DBALError } from '../core/errors'

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

  async getCapabilities(): Promise<AdapterCapabilities> {
    return this.baseAdapter.getCapabilities()
  }

  async close(): Promise<void> {
    await this.baseAdapter.close()
  }
}
