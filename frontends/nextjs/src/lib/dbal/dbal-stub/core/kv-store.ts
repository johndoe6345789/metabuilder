/**
 * DBAL KV Store Stub
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import type { TenantContext } from './tenant-context'

export class InMemoryKVStore {
  private store = new Map<string, any>()

  async get<T>(key: string, _context?: TenantContext): Promise<T | null> {
    return this.store.get(key) ?? null
  }

  async set<T>(key: string, value: T, _context?: TenantContext, _ttl?: number): Promise<void> {
    this.store.set(key, value)
  }

  async delete(key: string, _context?: TenantContext): Promise<boolean> {
    return this.store.delete(key)
  }

  async listAdd(key: string, items: any[], _context?: TenantContext): Promise<void> {
    const existing = this.store.get(key) || []
    this.store.set(key, [...existing, ...items])
  }

  async listGet(key: string, _context?: TenantContext, start = 0, end = -1): Promise<any[]> {
    const list = this.store.get(key) || []
    return end === -1 ? list.slice(start) : list.slice(start, end)
  }
}
