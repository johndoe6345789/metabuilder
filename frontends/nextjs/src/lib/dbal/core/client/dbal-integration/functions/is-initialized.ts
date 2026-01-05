import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'

export function isInitialized(): boolean {
  return this.initialized
}
