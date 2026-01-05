import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'

export function getClient(): DBALClient {
  if (!this.client) {
    throw new Error('DBAL not initialized. Call initialize() first.')
  }
  return this.client
}
