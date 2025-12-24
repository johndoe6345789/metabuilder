import type { DBALConfig } from '../runtime/config'
import type { DBALAdapter } from '../adapters/adapter'
import type { User, PageView, ComponentHierarchy, ListOptions, ListResult } from './types'
import { DBALError } from './errors'

export class DBALClient {
  private adapter: DBALAdapter
  private config: DBALConfig

  constructor(config: DBALConfig) {
    this.config = config
    this.adapter = this.createAdapter(config)
  }

  private createAdapter(config: DBALConfig): DBALAdapter {
    if (config.mode === 'production' && config.endpoint) {
      throw new Error('Production mode with remote endpoint not yet implemented')
    }

    switch (config.adapter) {
      case 'prisma':
        throw new Error('Prisma adapter to be implemented')
      case 'sqlite':
        throw new Error('SQLite adapter to be implemented')
      case 'mongodb':
        throw new Error('MongoDB adapter to be implemented')
      default:
        throw DBALError.internal('Unknown adapter type')
    }
  }

  get users() {
    return {
      create: async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
        return this.adapter.create('User', data) as Promise<User>
      },
      read: async (id: string): Promise<User | null> => {
        return this.adapter.read('User', id) as Promise<User | null>
      },
      update: async (id: string, data: Partial<User>): Promise<User> => {
        return this.adapter.update('User', id, data) as Promise<User>
      },
      delete: async (id: string): Promise<boolean> => {
        return this.adapter.delete('User', id)
      },
      list: async (options?: ListOptions): Promise<ListResult<User>> => {
        return this.adapter.list('User', options) as Promise<ListResult<User>>
      },
    }
  }

  get pages() {
    return {
      create: async (data: Omit<PageView, 'id' | 'createdAt' | 'updatedAt'>): Promise<PageView> => {
        return this.adapter.create('PageView', data) as Promise<PageView>
      },
      read: async (id: string): Promise<PageView | null> => {
        return this.adapter.read('PageView', id) as Promise<PageView | null>
      },
      readBySlug: async (slug: string): Promise<PageView | null> => {
        const result = await this.adapter.list('PageView', { filter: { slug } })
        return result.data[0] as PageView || null
      },
      update: async (id: string, data: Partial<PageView>): Promise<PageView> => {
        return this.adapter.update('PageView', id, data) as Promise<PageView>
      },
      delete: async (id: string): Promise<boolean> => {
        return this.adapter.delete('PageView', id)
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
