export type StorageBackend = 'flask' | 'indexeddb' | 'sqlite' | 'sparkkv'

export interface StorageAdapter {
  get<T>(key: string): Promise<T | undefined>
  set<T>(key: string, value: T): Promise<void>
  delete(key: string): Promise<void>
  keys(): Promise<string[]>
  clear(): Promise<void>
  close?(): Promise<void>
}
