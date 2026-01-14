/**
 * @file factory.ts
 * @description DBAL Client Factory
 *
 * Provides factory functions for creating and managing DBALClient instances.
 * Implements the singleton pattern for convenience while allowing configuration overrides.
 */

import type { DBALConfig } from '../../runtime/config'
import { getPrismaClient, createPrismaClient, type PrismaClientConfig } from '../../runtime/prisma-client'
import { DBALClient } from './client'

export interface DBALClientFactoryConfig extends Omit<DBALConfig, 'adapter'> {
  /**
   * Database URL for Prisma connection
   */
  databaseUrl?: string

  /**
   * Runtime environment
   */
  environment?: 'test' | 'integration' | 'production' | 'development'
}

/**
 * Global DBALClient singleton
 */
const globalDBAL = globalThis as { dbalClient?: DBALClient }

/**
 * Create a new DBALClient instance
 *
 * This always creates a fresh instance. For singleton access, use getDBALClient().
 */
export function createDBALClient(config?: DBALClientFactoryConfig): DBALClient {
  // Get or create Prisma client
  const prisma = createPrismaClient({
    databaseUrl: config?.databaseUrl,
    environment: config?.environment,
  })

  // Create DBAL client with Prisma
  return new DBALClient({
    mode: config?.mode || 'production',
    adapter: 'prisma',
    ...config,
    database: {
      ...config?.database,
      url: config?.databaseUrl || config?.database?.url,
    },
  })
}

/**
 * Get singleton DBALClient instance
 *
 * Returns existing instance if available without config override.
 * Pass config to create a new instance with different settings.
 *
 * @example
 * // Get or create singleton
 * const dbal = getDBALClient()
 *
 * @example
 * // Create instance with specific config
 * const testDbal = getDBALClient({ mode: 'development', databaseUrl: 'file::memory:' })
 */
export function getDBALClient(config?: DBALClientFactoryConfig): DBALClient {
  if (globalDBAL.dbalClient && !config) {
    return globalDBAL.dbalClient
  }

  globalDBAL.dbalClient = createDBALClient(config)
  return globalDBAL.dbalClient
}

/**
 * Convenience alias for getDBALClient
 * Shorter name for common usage
 */
export function useDBAL(config?: DBALClientFactoryConfig): DBALClient {
  return getDBALClient(config)
}

/**
 * Reset singleton (mainly for testing)
 */
export function resetDBALClient(): void {
  delete globalDBAL.dbalClient
}
