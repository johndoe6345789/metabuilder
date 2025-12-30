import { PrismaClient } from '@prisma/client'
import { PrismaAdapterDialect, type PrismaAdapterOptions, type PrismaContext } from './types'

export function createPrismaContext(
  databaseUrl?: string,
  options?: PrismaAdapterOptions
): PrismaContext {
  const inferredDialect = options?.dialect ?? inferDialectFromUrl(databaseUrl)
  const prisma = new PrismaClient({
    datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
  })

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
