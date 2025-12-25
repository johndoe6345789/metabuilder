import type { DBALAdapter } from './types'
import { prismaAdapter } from './create-prisma-adapter'

/**
 * Get the DBAL adapter singleton for database operations
 */
export const getAdapter = (): DBALAdapter => {
  return prismaAdapter
}
