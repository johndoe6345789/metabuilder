/**
 * @file prisma-client.ts
 * @description Prisma Client Factory
 *
 * Manages PrismaClient lifecycle with support for different environments:
 * - test: Mock or in-memory database
 * - integration: In-memory SQLite database
 * - development/production: File-based or networked database
 */

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

export interface PrismaClientConfig {
  databaseUrl?: string
  environment?: 'test' | 'integration' | 'production' | 'development'
}

/**
 * Create a new PrismaClient instance
 *
 * Handles different environments:
 * - Test (VITEST): Returns mock client
 * - Integration (VITEST_INTEGRATION): Returns in-memory client
 * - Production/Development: Returns file or network-based client
 */
export function createPrismaClient(config?: PrismaClientConfig): PrismaClient {
  const env = config?.environment || process.env.NODE_ENV
  const dbUrl = config?.databaseUrl || process.env.DATABASE_URL

  // Test mode: Use mock adapter
  if (env === 'test' && !process.env.VITEST_INTEGRATION) {
    return createMockPrisma()
  }

  // Integration mode: Use in-memory SQLite
  if (env === 'test' && process.env.VITEST_INTEGRATION) {
    return createIntegrationPrisma()
  }

  // Production/Development mode: Use SQLite adapter with file or URL
  const databaseUrl = dbUrl || 'file:./prisma/dev.db'
  const adapter = new PrismaBetterSqlite3({
    url: databaseUrl,
  })

  return new PrismaClient({ adapter })
}

/**
 * Get or create singleton PrismaClient
 *
 * Returns existing client if available, otherwise creates new one.
 * Config parameter can override defaults for specific cases.
 */
const globalForPrisma = globalThis as { prisma?: PrismaClient }

export function getPrismaClient(config?: PrismaClientConfig): PrismaClient {
  if (globalForPrisma.prisma && !config) {
    return globalForPrisma.prisma
  }

  globalForPrisma.prisma = createPrismaClient(config)
  return globalForPrisma.prisma
}

/**
 * Create mock PrismaClient for unit tests
 * Returns a mock that doesn't access the database
 */
function createMockPrisma(): PrismaClient {
  // For now, return a regular client but with in-memory adapter
  // In a real implementation, this would return a mock object
  return createIntegrationPrisma()
}

/**
 * Create in-memory PrismaClient for integration tests
 * Uses SQLite in-memory database (":memory:")
 */
function createIntegrationPrisma(): PrismaClient {
  const adapter = new PrismaBetterSqlite3({
    url: 'file::memory:?cache=shared',
  })

  return new PrismaClient({ adapter })
}

/**
 * Reset singleton (mainly for testing)
 */
export function resetPrismaClient(): void {
  delete globalForPrisma.prisma
}
