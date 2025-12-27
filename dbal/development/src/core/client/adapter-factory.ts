/**
 * @file adapter-factory.ts
 * @description Factory function for creating DBAL adapters based on configuration
 */

import type { DBALConfig } from '../../runtime/config'
import type { DBALAdapter } from '../../adapters/adapter'
import { DBALError } from '../foundation/errors'
import { PrismaAdapter, PostgresAdapter, MySQLAdapter } from '../../adapters/prisma'
import { ACLAdapter } from '../../adapters/acl-adapter'
import { WebSocketBridge } from '../../bridges/websocket-bridge'

/**
 * Creates the appropriate DBAL adapter based on configuration
 */
export const createAdapter = (config: DBALConfig): DBALAdapter => {
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
      case 'postgres':
        baseAdapter = new PostgresAdapter(
          config.database?.url,
          {
            queryTimeout: config.performance?.queryTimeout
          }
        )
        break
      case 'mysql':
        baseAdapter = new MySQLAdapter(
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
