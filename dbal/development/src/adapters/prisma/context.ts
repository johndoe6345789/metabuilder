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
  
  // For SQLite, we need to use the driver adapter
  if (inferredDialect === 'sqlite') {
    const dbPath = databaseUrl?.replace('file:', '') || '../../prisma/prisma/dev.db'
    const db = new Database(dbPath)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const adapter = new PrismaBetterSqlite3(db)
    prisma = new PrismaClient({ adapter } as any)
  } else {
    // For other databases, use the URL directly
    prisma = new PrismaClient(
      databaseUrl
        ? {
            datasources: { db: { url: databaseUrl } },
          } as any
        : undefined
    )
  }

  return {
    prisma,
    queryTimeout: options?.queryTimeout ?? 30000,
    dialect: inferredDialect ?? 'generic'
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
