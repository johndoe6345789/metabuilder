import 'server-only'

import type { DBALClient } from '@/dbal'

import { dbalState } from './dbal-state.server'
import { initializeDBAL } from './initialize-dbal.server'

/**
 * Get DBAL client instance (lazy initialization)
 */
export async function getDBAL(): Promise<DBALClient | null> {
  if (!dbalState.initialized) {
    await initializeDBAL()
  }
  return dbalState.client
}
