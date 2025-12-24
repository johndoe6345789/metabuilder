import type { DBALConfig } from '../runtime/config'
import type { DBALAdapter } from '../adapters/adapter'
import type { User, PageView, ComponentHierarchy, ListOptions, ListResult } from './types'
import { DBALError } from './errors'
import { PrismaAdapter } from '../adapters/prisma-adapter'
import { ACLAdapter } from '../adapters/acl-adapter'
import { WebSocketBridge } from '../bridges/websocket-bridge'
import {
  validateUserCreate,
  validateUserUpdate,
  validatePageCreate,
  validatePageUpdate,
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
        return this.adapter.create('ComponentHierarchy', data) as Promise<ComponentHierarchy>
      },
      read: async (id: string): Promise<ComponentHierarchy | null> => {
        return this.adapter.read('ComponentHierarchy', id) as Promise<ComponentHierarchy | null>
      },
      update: async (id: string, data: Partial<ComponentHierarchy>): Promise<ComponentHierarchy> => {
        return this.adapter.update('ComponentHierarchy', id, data) as Promise<ComponentHierarchy>
      },
      delete: async (id: string): Promise<boolean> => {
        return this.adapter.delete('ComponentHierarchy', id)
      },
      getTree: async (pageId: string): Promise<ComponentHierarchy[]> => {
        const result = await this.adapter.list('ComponentHierarchy', { filter: { pageId } })
        return result.data as ComponentHierarchy[]
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
