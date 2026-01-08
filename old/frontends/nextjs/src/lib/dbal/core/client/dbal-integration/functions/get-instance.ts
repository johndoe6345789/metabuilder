import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'

// Global instance for development
let instance: unknown = null

export function getInstance(): unknown {
  if (!instance) {
    // Initialize with basic development instance
    instance = {
      tenants: new Map(),
      store: new Map(),
      kvStore: new Map(),
    }
  }
  return instance
}
