import { DBALClient, type DBALConfig } from '@/dbal'

export function hasTenant(id: string): boolean {
  return this.tenants.has(id)
}
