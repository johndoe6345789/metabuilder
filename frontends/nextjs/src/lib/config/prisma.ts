import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prisma 7.x: Pass datasource configuration to the client constructor
// The URL is defined in prisma.config.ts and used during migration/generate
// At runtime, pass it to the client if needed, or use adapter for serverless
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
