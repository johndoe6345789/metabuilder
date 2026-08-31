/**
 * Server-Side DBAL Client (plain fetch)
 *
 * Minimal fetch wrapper for API routes and server-side code ONLY.
 * Client components must use the Redux useDBAL hook from
 * @metabuilder/api-clients,
 * which calls the C++ daemon directly via NEXT_PUBLIC_DBAL_API_URL.
 *
 * Usage:
 *   import { db } from '@/lib/db-client'
 *   const users = await db.users.list()
 *   const user = await db.users.read('user-123')
 */

import 'server-only'

export type {
  ListResult,
  ListOptions,
  EntityOps,
  DBALClient,
} from './db-client/types'
export { db, getDB } from './db-client/client'
