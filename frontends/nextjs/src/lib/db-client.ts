/**
 * Unified DBAL Client Integration
 *
 * Single source of truth for database access in Next.js frontend.
 * All database operations should use this client instead of direct Prisma access.
 *
 * Usage:
 *   import { db } from '@/lib/db-client'
 *   const users = await db.users.list()
 *   const user = await db.users.findOne({ id: 'user-123' })
 */

import { getDBALClient, type DBALClient } from '@/dbal'

/**
 * Get the current DBAL client instance
 * Singleton pattern - returns same instance unless config changes
 */
export function getDB(): DBALClient {
  return getDBALClient({
    mode: process.env.DBAL_MODE as any || 'production',
    environment: (process.env.NODE_ENV as any) || 'production'
  })
}

/**
 * Default DBAL client instance for server-side operations
 * Import as: import { db } from '@/lib/db-client'
 */
export const db = getDB()

/**
 * Type export for TypeScript consumers
 */
export type { DBALClient }
