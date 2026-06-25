/**
 * Configuration and copy text for storage settings operations
 */

/**
 * Storage backend type keys
 */
export type StorageBackendKey = 'indexeddb' | 'sqlite' | 'flask' | 'memory'

export const storageSettingsCopy = {
  toasts: {
    success: {
      export: 'Data exported successfully',
      import: 'Data imported successfully',
      switchFlask: 'Switched to Flask backend',
      switchSQLite: 'Switched to SQLite backend',
      switchIndexedDB: 'Switched to IndexedDB backend',
    },
    failure: {
      export: 'Failed to export data',
      import: 'Failed to import data',
      switchFlask: 'Failed to switch to Flask',
      switchSQLite: 'Failed to switch to SQLite',
      switchIndexedDB: 'Failed to switch to IndexedDB',
    },
    alreadyUsing: {
      flask: 'Already using Flask backend',
      sqlite: 'Already using SQLite backend',
      indexeddb: 'Already using IndexedDB backend',
    },
    errors: {
      missingFlaskUrl: 'Please enter a Flask server URL',
    },
  },
} as const
