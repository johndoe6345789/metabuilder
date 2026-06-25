/**
 * Legacy compatibility re-export for useKVStore.
 * The actual implementation is in ./src/useKVStore.ts and uses
 * the C++ DBAL REST API via fetch() instead of the TypeScript client.
 *
 * @deprecated Import from './src/useKVStore' or '@metabuilder/hooks' instead.
 */
export { useKVStore } from './src/useKVStore'
export type { UseKVStoreReturn } from './src/useKVStore'
