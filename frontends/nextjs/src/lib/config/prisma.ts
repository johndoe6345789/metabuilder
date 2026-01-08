/**
 * Prisma Client singleton instance
 * Prevents multiple instances in development with hot reloading
 */
 
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
  return new Proxy({}, handler) as unknown as PrismaClient
}

const createIntegrationPrisma = (): PrismaClient => {
  // For integration tests, use in-memory database via adapter factory
   
  const adapter = new PrismaBetterSqlite3({ url: ':memory:' })
  return new PrismaClient({ adapter })
}

const createProductionPrisma = (): PrismaClient => {
  // CRITICAL: Validate DATABASE_URL is set and properly formatted
  const databaseUrl = (process.env.DATABASE_URL !== undefined && process.env.DATABASE_URL.length > 0) 
    ? process.env.DATABASE_URL 
    : 'file:../../prisma/prisma/dev.db'
  
  console.warn('[Prisma] Creating production Prisma client')
  console.warn('[Prisma] DATABASE_URL from env:', process.env.DATABASE_URL)
  console.warn('[Prisma] Using database URL:', databaseUrl)
  
  // Validate URL format for SQLite
  if (!databaseUrl.startsWith('file:')) {
    throw new Error(`[Prisma] Invalid DATABASE_URL format: "${databaseUrl}". SQLite requires "file:" prefix.`)
  }
  
  try {
    // For Prisma 7, PrismaBetterSqlite3 is a FACTORY that takes config with url, not a client instance
     
    const adapter = new PrismaBetterSqlite3({ url: databaseUrl })
    console.warn('[Prisma] Adapter factory created successfully')
    
    const client = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn', 'query'] : ['error'],
    })
    console.warn('[Prisma] PrismaClient created successfully')
    
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
