import { DBALClient, type DBALConfig } from '@/dbal'

export function isInitialized(): boolean {
  return this.initialized
}
