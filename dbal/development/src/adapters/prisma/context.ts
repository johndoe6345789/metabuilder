import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaAdapterDialect, type PrismaAdapterOptions, type PrismaContext } from './types'

export function createPrismaContext(
  databaseUrl?: string,
  options?: PrismaAdapterOptions
): PrismaContext {
  console.log('[DBAL Prisma] Creating Prisma context')
  console.log('[DBAL Prisma] Database URL parameter:', databaseUrl)
  console.log('[DBAL Prisma] Options:', options)
  
  const inferredDialect = options?.dialect ?? inferDialectFromUrl(databaseUrl)
  console.log('[DBAL Prisma] Inferred dialect:', inferredDialect)
  
  let prisma: PrismaClient
  
  // For SQLite (or when dialect cannot be inferred), we need to use the driver adapter
  if (inferredDialect === 'sqlite' || !databaseUrl || inferredDialect === undefined) {
    // Use absolute path as fallback to avoid path resolution issues
    const fallbackUrl = 'file:/home/runner/work/metabuilder/metabuilder/prisma/prisma/dev.db'
    const finalUrl = databaseUrl || fallbackUrl
    
    // Ensure URL has file: prefix for SQLite
    const sqliteUrl = finalUrl.startsWith('file:') ? finalUrl : `file:${finalUrl}`
    
    console.log('[DBAL Prisma] Using SQLite URL:', sqliteUrl)
    
    try {
      // PrismaBetterSqlite3 is a factory that expects { url: string } config
      const adapter = new PrismaBetterSqlite3({ url: sqliteUrl })
      console.log('[DBAL Prisma] Adapter factory created successfully')
      
      prisma = new PrismaClient({ adapter } as any)
      console.log('[DBAL Prisma] PrismaClient created successfully')
    } catch (error) {
      console.error('[DBAL Prisma] Error creating Prisma client:', error)
      throw error
    }
  } else {
    // For PostgreSQL/MySQL with explicit connection strings
    // Note: Prisma 7 removed datasources config, so this may not work
    // Consider using adapters for all database types
    throw new Error(`Prisma 7 requires adapters. Unsupported database dialect: ${inferredDialect}. Please use SQLite or implement adapters for other databases.`)
  }

  return {
    prisma,
    queryTimeout: options?.queryTimeout ?? 30000,
    dialect: inferredDialect ?? 'sqlite'
  }
}

export function inferDialectFromUrl(url?: string): PrismaAdapterDialect | undefined {
  if (!url) {
    return undefined
  }

  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
    return 'postgres'
  }

  if (url.startsWith('mysql://')) {
    return 'mysql'
  }

  if (url.startsWith('file:') || url.startsWith('sqlite://')) {
    return 'sqlite'
  }

  return undefined
}
