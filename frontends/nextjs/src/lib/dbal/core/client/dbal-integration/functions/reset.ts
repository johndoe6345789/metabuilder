import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function reset(this: any): void {
  this.client = null
  this.tenantManager = null
  this.kvStore = null
  this.blobStorage = null
  this.initialized = false
}
