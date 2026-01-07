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
    this.operations = buildEntityOperations(this.adapter, this.config.tenantId)
  }

  /**
   * User entity operations
   */
  get users() {
    return this.operations.users
  }

  /**
   * PageConfig entity operations
   */
  get pageConfigs() {
    return this.operations.pageConfigs
  }

  /**
   * Deprecated: use pageConfigs
   */
  get pages() {
    return this.operations.pageConfigs
  }

  /**
   * ComponentNode entity operations
   */
  get componentNodes() {
    return this.operations.componentNodes
  }

  /**
   * Deprecated: use componentNodes
   */
  get components() {
    return this.operations.componentNodes
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
   * InstalledPackage entity operations
   */
  get installedPackages() {
    return this.operations.installedPackages
  }

  /**
   * Deprecated: use installedPackages
   */
  get packages() {
    return this.operations.installedPackages
  }

  /**
   * PackageData entity operations
   */
  get packageData() {
    return this.operations.packageData
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
