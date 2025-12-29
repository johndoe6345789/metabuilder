import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prisma 7.x: Requires an adapter for direct database connections
// The DATABASE_URL is configured in prisma.config.ts for CLI operations
// At runtime, we create an adapter with the database URL
function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db'

  // Extract file path from SQLite URL (format: "file:./path/to/db")
  const dbPath = databaseUrl.replace(/^file:/, '')

  // Create SQLite database connection
  const db = new Database(dbPath)

  // Create Prisma adapter for better-sqlite3
  const adapter = new PrismaBetterSqlite3(db)

  // Initialize Prisma Client with the adapter
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
