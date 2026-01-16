/**
 * @file factory.ts
 * @description DBAL Client Factory
 *
 * Provides a single factory function for creating and managing DBALClient instances.
 * Implements the singleton pattern for convenience while allowing configuration overrides.
 */

import type { DBALConfig } from '../../runtime/config'
import { createPrismaClient, type PrismaClientConfig } from '../../runtime/prisma-client'
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
 * Get or create DBALClient instance (singleton pattern)
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

  // Get or create Prisma client
  const prismaConfig: PrismaClientConfig = {}
  if (config?.databaseUrl) {
    prismaConfig.databaseUrl = config.databaseUrl
  }
  if (config?.environment) {
    prismaConfig.environment = config.environment
  }
  const prisma = createPrismaClient(prismaConfig)

  // Create DBAL client with Prisma
  // Use databaseUrl from config, database.url, or environment DATABASE_URL
  const databaseUrl = config?.databaseUrl || config?.database?.url || process.env.DATABASE_URL
  const dbalConfig: DBALConfig = {
    mode: config?.mode || 'production',
    adapter: 'prisma',
    ...config,
    database: {
      ...config?.database,
      ...(databaseUrl && { url: databaseUrl }),
    },
  }
  
  globalDBAL.dbalClient = new DBALClient(dbalConfig)
  return globalDBAL.dbalClient
}

/**
 * Reset singleton (mainly for testing)
 */
export function resetDBALClient(): void {
  delete globalDBAL.dbalClient
}
