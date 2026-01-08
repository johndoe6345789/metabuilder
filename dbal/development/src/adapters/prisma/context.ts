import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'
import { PrismaAdapterDialect, type PrismaAdapterOptions, type PrismaContext } from './types'

export function createPrismaContext(
  databaseUrl?: string,
  options?: PrismaAdapterOptions
): PrismaContext {
  const inferredDialect = options?.dialect ?? inferDialectFromUrl(databaseUrl)
  
  let prisma: PrismaClient
  
  // For SQLite (or when dialect cannot be inferred), we need to use the driver adapter
  if (inferredDialect === 'sqlite' || !databaseUrl || inferredDialect === undefined) {
    const dbPath = databaseUrl?.replace('file:', '').replace('sqlite://', '') || '../../prisma/prisma/dev.db'
    const db = new Database(dbPath)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const adapter = new PrismaBetterSqlite3(db)
    prisma = new PrismaClient({ adapter } as any)
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
