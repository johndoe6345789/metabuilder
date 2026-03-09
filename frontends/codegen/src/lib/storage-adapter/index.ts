import { AutoStorageAdapter } from './auto-storage-adapter'

export type { StorageAdapter } from './types'
export { AutoStorageAdapter } from './auto-storage-adapter'
export { FlaskBackendAdapter } from './flask-backend-adapter'
export { IndexedDBAdapter } from './indexeddb-adapter'

export const storageAdapter = new AutoStorageAdapter()
