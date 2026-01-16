// Legacy hook - cached data is available via getDBALClient()

import { getDBALClient } from '@/dbal'

/**
 * Hook for accessing cached data via DBAL client
 */
export function useCachedData<T>(key: string, tenantId?: string, userId?: string) {
  return {
    getClient: getDBALClient,
  }
}
