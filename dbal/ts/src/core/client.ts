import type { DBALConfig } from '../runtime/config'
import type { DBALAdapter } from '../adapters/adapter'
import type { User, PageView, ComponentHierarchy, Workflow, LuaScript, Package, Session, ListOptions, ListResult } from './types'
import { DBALError } from './errors'
import { PrismaAdapter } from '../adapters/prisma-adapter'
import { ACLAdapter } from '../adapters/acl-adapter'
import { WebSocketBridge } from '../bridges/websocket-bridge'
import {
  validateUserCreate,
  validateUserUpdate,
  validatePageCreate,
  validatePageUpdate,
  validateComponentHierarchyCreate,
  validateComponentHierarchyUpdate,
  validateWorkflowCreate,
  validateWorkflowUpdate,
  validateLuaScriptCreate,
  validateLuaScriptUpdate,
  validatePackageCreate,
  validatePackageUpdate,
  validateSessionCreate,
  validateSessionUpdate,
  validateId,
} from './validation'

export class DBALClient {
  private adapter: DBALAdapter
  private config: DBALConfig

  constructor(config: DBALConfig) {
    this.config = config
    
    // Validate configuration
    if (!config.adapter) {
      throw new Error('Adapter type must be specified')
    }
    if (config.mode !== 'production' && !config.database?.url) {
      throw new Error('Database URL must be specified for non-production mode')
    }
    
    this.adapter = this.createAdapter(config)
  }

  private createAdapter(config: DBALConfig): DBALAdapter {
    let baseAdapter: DBALAdapter

    if (config.mode === 'production' && config.endpoint) {
      baseAdapter = new WebSocketBridge(config.endpoint, config.auth)
    } else {
      switch (config.adapter) {
        case 'prisma':
          baseAdapter = new PrismaAdapter(
            config.database?.url,
            {
              queryTimeout: config.performance?.queryTimeout
            }
          )
          break
        case 'sqlite':
          throw new Error('SQLite adapter to be implemented in Phase 3')
        case 'mongodb':
          throw new Error('MongoDB adapter to be implemented in Phase 3')
        default:
          throw DBALError.internal('Unknown adapter type')
      }
    }

    if (config.auth?.user && config.security?.sandbox !== 'disabled') {
      return new ACLAdapter(
        baseAdapter,
        config.auth.user,
        {
          auditLog: config.security?.enableAuditLog ?? true
        }
      )
    }

    return baseAdapter
  }

  get users() {
    return {
      create: async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
        // Validate input
        const validationErrors = validateUserCreate(data)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid user data',
            validationErrors.map(error => ({ field: 'user', error }))
          )
        }

        try {
          return this.adapter.create('User', data) as Promise<User>
        } catch (error) {
          // Check for conflict errors (unique constraints)
          if (error instanceof DBALError && error.code === 409) {
            throw DBALError.conflict(`User with username or email already exists`)
          }
          throw error
        }
      },
      read: async (id: string): Promise<User | null> => {
        // Validate ID
        const validationErrors = validateId(id)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid user ID',
            validationErrors.map(error => ({ field: 'id', error }))
          )
        }

        const result = await this.adapter.read('User', id) as User | null
        if (!result) {
          throw DBALError.notFound(`User not found: ${id}`)
        }
        return result
      },
      update: async (id: string, data: Partial<User>): Promise<User> => {
        // Validate ID
        const idErrors = validateId(id)
        if (idErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid user ID',
            idErrors.map(error => ({ field: 'id', error }))
          )
        }

        // Validate update data
        const validationErrors = validateUserUpdate(data)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid user update data',
            validationErrors.map(error => ({ field: 'user', error }))
          )
        }

        try {
          return this.adapter.update('User', id, data) as Promise<User>
        } catch (error) {
          // Check for conflict errors (unique constraints)
          if (error instanceof DBALError && error.code === 409) {
            throw DBALError.conflict(`Username or email already exists`)
          }
          throw error
        }
      },
      delete: async (id: string): Promise<boolean> => {
        // Validate ID
        const validationErrors = validateId(id)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid user ID',
            validationErrors.map(error => ({ field: 'id', error }))
          )
        }

        const result = await this.adapter.delete('User', id)
        if (!result) {
          throw DBALError.notFound(`User not found: ${id}`)
        }
        return result
      },
      list: async (options?: ListOptions): Promise<ListResult<User>> => {
        return this.adapter.list('User', options) as Promise<ListResult<User>>
      },
    }
  }

  get pages() {
    return {
      create: async (data: Omit<PageView, 'id' | 'createdAt' | 'updatedAt'>): Promise<PageView> => {
        // Validate input
        const validationErrors = validatePageCreate(data)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid page data',
            validationErrors.map(error => ({ field: 'page', error }))
          )
        }

        try {
          return this.adapter.create('PageView', data) as Promise<PageView>
        } catch (error) {
          // Check for conflict errors (unique slug)
          if (error instanceof DBALError && error.code === 409) {
            throw DBALError.conflict(`Page with slug '${data.slug}' already exists`)
          }
          throw error
        }
      },
      read: async (id: string): Promise<PageView | null> => {
        // Validate ID
        const validationErrors = validateId(id)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid page ID',
            validationErrors.map(error => ({ field: 'id', error }))
          )
        }

        const result = await this.adapter.read('PageView', id) as PageView | null
        if (!result) {
          throw DBALError.notFound(`Page not found: ${id}`)
        }
        return result
      },
      readBySlug: async (slug: string): Promise<PageView | null> => {
        // Validate slug
        if (!slug || slug.trim().length === 0) {
          throw DBALError.validationError('Slug cannot be empty', [
            { field: 'slug', error: 'Slug is required' }
          ])
        }

        const result = await this.adapter.list('PageView', { filter: { slug } })
        if (result.data.length === 0) {
          throw DBALError.notFound(`Page not found with slug: ${slug}`)
        }
        return result.data[0] as PageView
      },
      update: async (id: string, data: Partial<PageView>): Promise<PageView> => {
        // Validate ID
        const idErrors = validateId(id)
        if (idErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid page ID',
            idErrors.map(error => ({ field: 'id', error }))
          )
        }

        // Validate update data
        const validationErrors = validatePageUpdate(data)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid page update data',
            validationErrors.map(error => ({ field: 'page', error }))
          )
        }

        try {
          return this.adapter.update('PageView', id, data) as Promise<PageView>
        } catch (error) {
          // Check for conflict errors (unique slug)
          if (error instanceof DBALError && error.code === 409) {
            throw DBALError.conflict(`Slug already exists`)
          }
          throw error
        }
      },
      delete: async (id: string): Promise<boolean> => {
        // Validate ID
        const validationErrors = validateId(id)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid page ID',
            validationErrors.map(error => ({ field: 'id', error }))
          )
        }

        const result = await this.adapter.delete('PageView', id)
        if (!result) {
          throw DBALError.notFound(`Page not found: ${id}`)
        }
        return result
      },
      list: async (options?: ListOptions): Promise<ListResult<PageView>> => {
        return this.adapter.list('PageView', options) as Promise<ListResult<PageView>>
      },
    }
  }

  get components() {
    return {
      create: async (data: Omit<ComponentHierarchy, 'id' | 'createdAt' | 'updatedAt'>): Promise<ComponentHierarchy> => {
        const validationErrors = validateComponentHierarchyCreate(data)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid component data',
            validationErrors.map(error => ({ field: 'component', error }))
          )
        }

        return this.adapter.create('ComponentHierarchy', data) as Promise<ComponentHierarchy>
      },
      read: async (id: string): Promise<ComponentHierarchy | null> => {
        const validationErrors = validateId(id)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid component ID',
            validationErrors.map(error => ({ field: 'id', error }))
          )
        }

        return this.adapter.read('ComponentHierarchy', id) as Promise<ComponentHierarchy | null>
      },
      update: async (id: string, data: Partial<ComponentHierarchy>): Promise<ComponentHierarchy> => {
        const idErrors = validateId(id)
        if (idErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid component ID',
            idErrors.map(error => ({ field: 'id', error }))
          )
        }

        const validationErrors = validateComponentHierarchyUpdate(data)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid component update data',
            validationErrors.map(error => ({ field: 'component', error }))
          )
        }

        return this.adapter.update('ComponentHierarchy', id, data) as Promise<ComponentHierarchy>
      },
      delete: async (id: string): Promise<boolean> => {
        const validationErrors = validateId(id)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid component ID',
            validationErrors.map(error => ({ field: 'id', error }))
          )
        }

        return this.adapter.delete('ComponentHierarchy', id)
      },
      getTree: async (pageId: string): Promise<ComponentHierarchy[]> => {
        const validationErrors = validateId(pageId)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid page ID',
            validationErrors.map(error => ({ field: 'pageId', error }))
          )
        }

        const result = await this.adapter.list('ComponentHierarchy', { filter: { pageId } })
        return result.data as ComponentHierarchy[]
      },
    }
  }

  get workflows() {
    return {
      create: async (data: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workflow> => {
        const validationErrors = validateWorkflowCreate(data)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid workflow data',
            validationErrors.map(error => ({ field: 'workflow', error }))
          )
        }

        try {
          return this.adapter.create('Workflow', data) as Promise<Workflow>
        } catch (error) {
          if (error instanceof DBALError && error.code === 409) {
            throw DBALError.conflict(`Workflow with name '${data.name}' already exists`)
          }
          throw error
        }
      },
      read: async (id: string): Promise<Workflow | null> => {
        const validationErrors = validateId(id)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid workflow ID',
            validationErrors.map(error => ({ field: 'id', error }))
          )
        }

        const result = await this.adapter.read('Workflow', id) as Workflow | null
        if (!result) {
          throw DBALError.notFound(`Workflow not found: ${id}`)
        }
        return result
      },
      update: async (id: string, data: Partial<Workflow>): Promise<Workflow> => {
        const idErrors = validateId(id)
        if (idErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid workflow ID',
            idErrors.map(error => ({ field: 'id', error }))
          )
        }

        const validationErrors = validateWorkflowUpdate(data)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid workflow update data',
            validationErrors.map(error => ({ field: 'workflow', error }))
          )
        }

        try {
          return this.adapter.update('Workflow', id, data) as Promise<Workflow>
        } catch (error) {
          if (error instanceof DBALError && error.code === 409) {
            throw DBALError.conflict('Workflow name already exists')
          }
          throw error
        }
      },
      delete: async (id: string): Promise<boolean> => {
        const validationErrors = validateId(id)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid workflow ID',
            validationErrors.map(error => ({ field: 'id', error }))
          )
        }

        const result = await this.adapter.delete('Workflow', id)
        if (!result) {
          throw DBALError.notFound(`Workflow not found: ${id}`)
        }
        return result
      },
      list: async (options?: ListOptions): Promise<ListResult<Workflow>> => {
        return this.adapter.list('Workflow', options) as Promise<ListResult<Workflow>>
      },
    }
  }

  get luaScripts() {
    return {
      create: async (data: Omit<LuaScript, 'id' | 'createdAt' | 'updatedAt'>): Promise<LuaScript> => {
        const validationErrors = validateLuaScriptCreate(data)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid Lua script data',
            validationErrors.map(error => ({ field: 'luaScript', error }))
          )
        }

        try {
          return this.adapter.create('LuaScript', data) as Promise<LuaScript>
        } catch (error) {
          if (error instanceof DBALError && error.code === 409) {
            throw DBALError.conflict(`Lua script with name '${data.name}' already exists`)
          }
          throw error
        }
      },
      read: async (id: string): Promise<LuaScript | null> => {
        const validationErrors = validateId(id)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid Lua script ID',
            validationErrors.map(error => ({ field: 'id', error }))
          )
        }

        const result = await this.adapter.read('LuaScript', id) as LuaScript | null
        if (!result) {
          throw DBALError.notFound(`Lua script not found: ${id}`)
        }
        return result
      },
      update: async (id: string, data: Partial<LuaScript>): Promise<LuaScript> => {
        const idErrors = validateId(id)
        if (idErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid Lua script ID',
            idErrors.map(error => ({ field: 'id', error }))
          )
        }

        const validationErrors = validateLuaScriptUpdate(data)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid Lua script update data',
            validationErrors.map(error => ({ field: 'luaScript', error }))
          )
        }

        try {
          return this.adapter.update('LuaScript', id, data) as Promise<LuaScript>
        } catch (error) {
          if (error instanceof DBALError && error.code === 409) {
            throw DBALError.conflict('Lua script name already exists')
          }
          throw error
        }
      },
      delete: async (id: string): Promise<boolean> => {
        const validationErrors = validateId(id)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid Lua script ID',
            validationErrors.map(error => ({ field: 'id', error }))
          )
        }

        const result = await this.adapter.delete('LuaScript', id)
        if (!result) {
          throw DBALError.notFound(`Lua script not found: ${id}`)
        }
        return result
      },
      list: async (options?: ListOptions): Promise<ListResult<LuaScript>> => {
        return this.adapter.list('LuaScript', options) as Promise<ListResult<LuaScript>>
      },
    }
  }

  get packages() {
    return {
      create: async (data: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>): Promise<Package> => {
        const validationErrors = validatePackageCreate(data)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid package data',
            validationErrors.map(error => ({ field: 'package', error }))
          )
        }

        try {
          return this.adapter.create('Package', data) as Promise<Package>
        } catch (error) {
          if (error instanceof DBALError && error.code === 409) {
            throw DBALError.conflict(`Package ${data.name}@${data.version} already exists`)
          }
          throw error
        }
      },
      read: async (id: string): Promise<Package | null> => {
        const validationErrors = validateId(id)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid package ID',
            validationErrors.map(error => ({ field: 'id', error }))
          )
        }

        const result = await this.adapter.read('Package', id) as Package | null
        if (!result) {
          throw DBALError.notFound(`Package not found: ${id}`)
        }
        return result
      },
      update: async (id: string, data: Partial<Package>): Promise<Package> => {
        const idErrors = validateId(id)
        if (idErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid package ID',
            idErrors.map(error => ({ field: 'id', error }))
          )
        }

        const validationErrors = validatePackageUpdate(data)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid package update data',
            validationErrors.map(error => ({ field: 'package', error }))
          )
        }

        try {
          return this.adapter.update('Package', id, data) as Promise<Package>
        } catch (error) {
          if (error instanceof DBALError && error.code === 409) {
            throw DBALError.conflict('Package name+version already exists')
          }
          throw error
        }
      },
      delete: async (id: string): Promise<boolean> => {
        const validationErrors = validateId(id)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid package ID',
            validationErrors.map(error => ({ field: 'id', error }))
          )
        }

        const result = await this.adapter.delete('Package', id)
        if (!result) {
          throw DBALError.notFound(`Package not found: ${id}`)
        }
        return result
      },
      list: async (options?: ListOptions): Promise<ListResult<Package>> => {
        return this.adapter.list('Package', options) as Promise<ListResult<Package>>
      },
    }
  }

  get sessions() {
    return {
      create: async (data: Omit<Session, 'id' | 'createdAt' | 'lastActivity'>): Promise<Session> => {
        const validationErrors = validateSessionCreate(data)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid session data',
            validationErrors.map(error => ({ field: 'session', error }))
          )
        }

        try {
          return this.adapter.create('Session', data) as Promise<Session>
        } catch (error) {
          if (error instanceof DBALError && error.code === 409) {
            throw DBALError.conflict('Session token already exists')
          }
          throw error
        }
      },
      read: async (id: string): Promise<Session | null> => {
        const validationErrors = validateId(id)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid session ID',
            validationErrors.map(error => ({ field: 'id', error }))
          )
        }

        const result = await this.adapter.read('Session', id) as Session | null
        if (!result) {
          throw DBALError.notFound(`Session not found: ${id}`)
        }
        return result
      },
      update: async (id: string, data: Partial<Session>): Promise<Session> => {
        const idErrors = validateId(id)
        if (idErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid session ID',
            idErrors.map(error => ({ field: 'id', error }))
          )
        }

        const validationErrors = validateSessionUpdate(data)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid session update data',
            validationErrors.map(error => ({ field: 'session', error }))
          )
        }

        try {
          return this.adapter.update('Session', id, data) as Promise<Session>
        } catch (error) {
          if (error instanceof DBALError && error.code === 409) {
            throw DBALError.conflict('Session token already exists')
          }
          throw error
        }
      },
      delete: async (id: string): Promise<boolean> => {
        const validationErrors = validateId(id)
        if (validationErrors.length > 0) {
          throw DBALError.validationError(
            'Invalid session ID',
            validationErrors.map(error => ({ field: 'id', error }))
          )
        }

        const result = await this.adapter.delete('Session', id)
        if (!result) {
          throw DBALError.notFound(`Session not found: ${id}`)
        }
        return result
      },
      list: async (options?: ListOptions): Promise<ListResult<Session>> => {
        return this.adapter.list('Session', options) as Promise<ListResult<Session>>
      },
    }
  }

  async capabilities() {
    return this.adapter.getCapabilities()
  }

  async close(): Promise<void> {
    await this.adapter.close()
  }
}
