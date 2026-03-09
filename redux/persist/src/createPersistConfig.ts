import type { PersistConfig } from 'redux-persist'
import { createIndexedDBStorage } from './indexedDBStorage'

export interface MetaPersistOptions {
  /** Root key for persisted state (default: 'root') */
  key?: string
  /** Override storage engine (default: IndexedDB) */
  storage?: any
  /** Slices to persist (mutually exclusive with blacklist) */
  whitelist?: string[]
  /** Slices to exclude from persistence */
  blacklist?: string[]
  /** State version for migrations (default: 1) */
  version?: number
  /** Migration function for state version upgrades */
  migrate?: PersistConfig<any>['migrate']
  /** Write throttle in milliseconds (default: 300) */
  throttle?: number
  /** Enable debug logging (default: false) */
  debug?: boolean
}

export function createPersistConfig<S = any>(options: MetaPersistOptions = {}): PersistConfig<S> {
  return {
    key: options.key || 'root',
    storage: options.storage || createIndexedDBStorage(),
    whitelist: options.whitelist,
    blacklist: options.blacklist,
    version: options.version || 1,
    migrate: options.migrate,
    throttle: options.throttle || 300,
    debug: options.debug || false,
  }
}
