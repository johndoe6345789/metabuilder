/**
 * DBAL Client Singleton
 *
 * Provides centralized access to the Database Abstraction Layer.
 * All db/ lambda functions should use this instead of importing Prisma directly.
 *
 * This uses the PrismaClient directly but wraps it in a DBAL-compatible interface,
 * providing a migration path to the full DBAL when ready.
 */

export type { DBALAdapter, ListOptions, ListResult } from '../dbal-client/types'

export { getAdapter } from '../dbal-client/adapter/get-adapter'
export { closeAdapter } from '../dbal-client/adapter/close-adapter'
