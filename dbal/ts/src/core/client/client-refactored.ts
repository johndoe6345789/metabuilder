/**
 * @file client.ts
 * @description Refactored DBAL Client using modular entity operations
 * 
 * This is the streamlined client that delegates to entity-specific operation modules.
 */

import type { DBALConfig } from '../runtime/config'
import type { DBALAdapter } from '../adapters/adapter'
import { DBALError } from './errors'
import { PrismaAdapter } from '../adapters/prisma-adapter'
import { ACLAdapter } from '../adapters/acl-adapter'
import { WebSocketBridge } from '../bridges/websocket-bridge'
import {
  createUserOperations,
  createPageOperations,
  createComponentOperations,
  createWorkflowOperations,
  createLuaScriptOperations,
  createPackageOperations,
  createSessionOperations,
} from './entities'

/**
 * Create the appropriate adapter based on configuration
 */
const createAdapter = (config: DBALConfig): DBALAdapter => {
  let baseAdapter: DBALAdapter

  if (config.mode === 'production' && config.endpoint) {
    baseAdapter = new WebSocketBridge(config.endpoint, config.auth)
  } else {
    switch (config.adapter) {
      case 'prisma':
      case 'postgres':
      case 'mysql':
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

/**
 * DBAL Client - Main interface for database operations
 * 
 * Provides CRUD operations for all entities through modular operation handlers.
 * Each entity type has its own dedicated operations module following the
 * single-responsibility pattern.
 */
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
