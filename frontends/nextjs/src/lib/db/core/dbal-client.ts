// Legacy compatibility layer - re-exports getDBALClient as getAdapter
// This is a temporary shim to migrate away from the old adapter pattern
// TODO: Replace all getAdapter() calls with getDBALClient()

import { getDBALClient } from '@/dbal'

/**
 * @deprecated Use getDBALClient() instead
 * Legacy function for backward compatibility
 */
export function getAdapter() {
  return getDBALClient()
}

// Re-export everything from DBAL for compatibility
export { getDBALClient } from '@/dbal'
