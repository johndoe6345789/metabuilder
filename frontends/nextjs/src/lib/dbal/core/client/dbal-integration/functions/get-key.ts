import { DBALClient, type DBALConfig } from '@/dbal'

export function getKey(key: string, context: TenantContext): string {
    return `${context.tenantId}:${key}`
  }
