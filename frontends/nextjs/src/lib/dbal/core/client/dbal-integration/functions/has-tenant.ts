import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hasTenant(this: any, id: string): boolean {
  return this.tenants.has(id)
}
