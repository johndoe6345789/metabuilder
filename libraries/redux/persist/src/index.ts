/**
 * @metabuilder/redux-persist
 *
 * Unified Redux Persist integration with IndexedDB storage for MetaBuilder.
 * Replaces custom persistence middleware across all subprojects with a single
 * standard library integration.
 *
 * Usage:
 * ```ts
 * import { createPersistedStore } from '@metabuilder/redux-persist'
 *
 * const { store, persistor } = createPersistedStore({
 *   reducers: { files, models, theme, settings },
 *   persist: {
 *     key: 'my-app',
 *     whitelist: ['files', 'models', 'theme', 'settings'],
 *   },
 * })
 * ```
 */

// Core API
export { createPersistedStore, PERSIST_ACTIONS } from './createPersistedStore'
export type { PersistedStoreOptions } from './createPersistedStore'

export { createPersistConfig } from './createPersistConfig'
export type { MetaPersistOptions } from './createPersistConfig'

export { createIndexedDBStorage } from './indexedDBStorage'

// Hook
export { usePersistGate } from './usePersistGate'

// Re-export commonly used redux-persist utilities
export { purgeStoredState, persistStore, persistReducer } from 'redux-persist'
export { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
