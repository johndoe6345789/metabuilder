/**
 * Database module - re-exports from @/lib/db
 *
 * This file exists for backward compatibility.
 * Prefer importing directly from '@/lib/db' for new code.
 */

// Re-export everything from the db/core module
export * from '../db/core'
export { Database } from '../db/core'
