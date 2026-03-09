/**
 * Legacy compatibility re-export for useBlobStorage.
 * The actual implementation is in ./src/useBlobStorage.ts and uses
 * the C++ DBAL REST API via fetch() instead of the TypeScript client.
 *
 * @deprecated Import from './src/useBlobStorage' or '@metabuilder/hooks' instead.
 */
export { useBlobStorage } from './src/useBlobStorage'
export type { UseBlobStorageReturn } from './src/useBlobStorage'
