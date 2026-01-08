/**
 * Prisma Client singleton instance
 * Prevents multiple instances in development with hot reloading
 */
 
 
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
// Prisma client types are generated; when they resolve as error types in linting,
// these assignments/calls are safe for runtime but look unsafe to the linter.
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const isTestEnv = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true'
const isIntegrationTest = process.env.VITEST_INTEGRATION === 'true'

const createMockPrisma = (): PrismaClient => {
  const message =
    'Prisma client is mocked for unit tests. Run integration tests with VITEST_INTEGRATION=true if you need a DB.'
  const handler: ProxyHandler<Record<string, unknown>> = {
    get(_target, prop) {
      if (prop === '$connect' || prop === '$disconnect') {
        return () => Promise.resolve(undefined)
      }
      if (prop === '$transaction') {
        return () => Promise.reject(new Error(message))
      }
      throw new Error(message)
    },
  }
  return new Proxy({}, handler) as PrismaClient
}

const createIntegrationPrisma = (): PrismaClient => {
  // For integration tests, use in-memory database via adapter factory
  const adapter = new PrismaBetterSqlite3({ url: ':memory:' })
  return new PrismaClient({ adapter })
}

const createProductionPrisma = (): PrismaClient => {
  // CRITICAL: Validate DATABASE_URL is set and properly formatted
  const databaseUrl = process.env.DATABASE_URL || 'file:/home/runner/work/metabuilder/metabuilder/prisma/prisma/dev.db'
  
  console.log('[Prisma] Creating production Prisma client')
  console.log('[Prisma] DATABASE_URL from env:', process.env.DATABASE_URL)
  console.log('[Prisma] Using database URL:', databaseUrl)
  
  // Validate URL format for SQLite
  if (!databaseUrl.startsWith('file:')) {
    throw new Error(`[Prisma] Invalid DATABASE_URL format: "${databaseUrl}". SQLite requires "file:" prefix.`)
  }
  
  try {
    // For Prisma 7, PrismaBetterSqlite3 is a FACTORY that takes config with url, not a client instance
    const adapter = new PrismaBetterSqlite3({ url: databaseUrl })
    console.log('[Prisma] Adapter factory created successfully')
    
    const client = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn', 'query'] : ['error'],
    })
    console.log('[Prisma] PrismaClient created successfully')
    
    return client
  } catch (error) {
    console.error('[Prisma] Error creating Prisma client:', error)
    throw error
  }
}

export const prisma =
  globalForPrisma.prisma ??
  (isTestEnv
    ? (isIntegrationTest ? createIntegrationPrisma() : createMockPrisma())
    : createProductionPrisma())

if (process.env.NODE_ENV !== 'production' && (!isTestEnv || isIntegrationTest)) {
  globalForPrisma.prisma = prisma
}
