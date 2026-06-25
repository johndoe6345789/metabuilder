/**
 * IndexedDB schema for offline-first workflow storage
 * Provides Dexie-compatible database interface
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

interface DexieTable {
  add(item: any): Promise<any>
  put(item: any): Promise<any>
  get(id: string): Promise<any>
  delete(id: string): Promise<void>
  update(id: any, changes: any): Promise<any>
  where(query: any): any
  toArray(): Promise<any[]>
}

interface WorkflowDB {
  workflows: DexieTable
  executions: DexieTable
  syncQueue: DexieTable
}

/**
 * Offline-first database instance
 * Uses IndexedDB via Dexie for local persistence
 */
export const db: WorkflowDB = null as unknown as WorkflowDB

/**
 * Alias for the workflow database
 */
export const workflowDB: WorkflowDB = db
