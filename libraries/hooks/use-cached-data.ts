/**
 * Legacy compatibility hook for cached data access.
 * Now uses the C++ DBAL REST API via the KV store hook instead of
 * the TypeScript DBALClient directly.
 *
 * @deprecated Use useKVStore from './src/useKVStore' or '@metabuilder/hooks' instead.
 */

import { useKVStore } from './src/useKVStore'

export function useCachedData<T>(key: string, tenantId?: string, _userId?: string) {
  const kv = useKVStore({
    tenant: tenantId ?? 'default',
    packageId: 'core',
  })

  return {
    loading: kv.loading,
    error: kv.error,
    get: () => kv.get(key) as Promise<T | null>,
    set: (value: T) => kv.set(key, value as unknown as import('./src/types').StorableValue),
    remove: () => kv.remove(key),
  }
}
