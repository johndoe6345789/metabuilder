import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'

export function hasTenant(id: string): boolean {
  return this.tenants.has(id)
}
