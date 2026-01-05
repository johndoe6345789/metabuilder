import { DBALClient, type DBALConfig } from '@/dbal'
import type { TenantContext } from '@/dbal/core/foundation/tenant-context'

export function getKey(key: string, context: TenantContext): string {
  return `${context.tenantId}:${key}`
}
