// Legacy hook - blob storage is available via getDBALClient()

import { getDBALClient } from '@/dbal'

/**
 * Hook for blob storage operations via DBAL client
 */
export function useBlobStorage() {
  return {
    getClient: getDBALClient,
  }
}
