/**
 * @file client.ts
 * @description DBAL Client - Main interface for database operations
 * 
 * Provides CRUD operations for all entities through modular operation handlers.
 * Each entity type has its own dedicated operations module following the
 * single-responsibility pattern.
 */

import type { DBALConfig } from '../../runtime/config'
import type { DBALAdapter } from '../../adapters/adapter'
import { createAdapter } from './adapter-factory'
import {
  createUserOperations,
  createPageOperations,
  createComponentOperations,
  createWorkflowOperations,
  createLuaScriptOperations,
  createPackageOperations,
  createSessionOperations,
} from '../entities'

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
    
    this.adapter = createAdapter(config)
  }

  /**
   * User entity operations
   */
  get users() {
    return createUserOperations(this.adapter)
  }

  /**
   * Page entity operations
   */
  get pages() {
    return createPageOperations(this.adapter)
  }

  /**
   * Component hierarchy entity operations
   */
  get components() {
    return createComponentOperations(this.adapter)
  }

  /**
   * Workflow entity operations
   */
  get workflows() {
    return createWorkflowOperations(this.adapter)
  }

  /**
   * Lua script entity operations
   */
  get luaScripts() {
    return createLuaScriptOperations(this.adapter)
  }

  /**
   * Package entity operations
   */
  get packages() {
    return createPackageOperations(this.adapter)
  }

  /**
   * Session entity operations
   */
  get sessions() {
    return createSessionOperations(this.adapter)
  }

  /**
   * Get adapter capabilities
   */
  async capabilities() {
    return this.adapter.getCapabilities()
  }

  /**
   * Close the client connection
   */
  async close(): Promise<void> {
    await this.adapter.close()
  }
}
