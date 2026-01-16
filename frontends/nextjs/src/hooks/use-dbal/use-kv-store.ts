// Legacy hook - KV operations are available via getDBALClient()

import { getDBALClient } from '@/dbal'

/**
 * Hook for KV store access via DBAL client
 */
export function useKVStore(tenantId: string = 'default', userId: string = 'system') {
  return {
    getClient: getDBALClient,
  }
}
