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
import { buildAdapter, buildEntityOperations } from './builders'
import { normalizeClientConfig, validateClientConfig } from './mappers'

export class DBALClient {
  private adapter: DBALAdapter
  private config: DBALConfig
  private operations: ReturnType<typeof buildEntityOperations>

  constructor(config: DBALConfig) {
    this.config = normalizeClientConfig(validateClientConfig(config))
    this.adapter = buildAdapter(this.config)
    this.operations = buildEntityOperations(this.adapter)
  }

  /**
   * User entity operations
   */
  get users() {
    return this.operations.users
  }

  /**
   * Page entity operations
   */
  get pages() {
    return this.operations.pages
  }

  /**
   * Component hierarchy entity operations
   */
  get components() {
    return this.operations.components
  }

  /**
   * Workflow entity operations
   */
  get workflows() {
    return this.operations.workflows
  }

  /**
   * Lua script entity operations
   */
  get luaScripts() {
    return this.operations.luaScripts
  }

  /**
   * Package entity operations
   */
  get packages() {
    return this.operations.packages
  }

  /**
   * Session entity operations
   */
  get sessions() {
    return this.operations.sessions
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
