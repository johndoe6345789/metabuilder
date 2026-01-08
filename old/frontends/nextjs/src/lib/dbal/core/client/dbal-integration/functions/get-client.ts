import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'

interface DBALClientState {
  client?: _DBALClient
}

export function getClient(this: DBALClientState): _DBALClient {
  if (!this.client) {
    throw new Error('DBAL not initialized. Call initialize() first.')
  }
  return this.client
}
