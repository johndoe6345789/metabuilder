import { DBALClient, type DBALConfig } from '@/dbal'

export function reset(): void {
  this.client = null
  this.tenantManager = null
  this.kvStore = null
  this.blobStorage = null
  this.initialized = false
}
