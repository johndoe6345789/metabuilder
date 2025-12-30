/**
 * DBAL Bindings for Lua Scripts
 *
 * Provides Lua scripts access to DBAL operations (KV store, blob storage, cached data)
 * through a bridge that connects to the TypeScript DBAL client.
 */

import type { JsonValue } from '@/types/utility-types'

export interface DBALBindings {
  kv: {
    get: (key: string) => Promise<JsonValue | null>
    set: (key: string, value: JsonValue, ttl?: number) => Promise<void>
    delete: (key: string) => Promise<boolean>
    listAdd: (key: string, items: string[]) => Promise<void>
    listGet: (key: string) => Promise<string[]>
  }
  blob: {
    upload: (name: string, data: string, metadata?: Record<string, string>) => Promise<void>
    download: (name: string) => Promise<string>
    delete: (name: string) => Promise<void>
    list: () => Promise<string[]>
  }
  cache: {
    get: (key: string) => Promise<JsonValue | null>
    set: (key: string, value: JsonValue, ttl?: number) => Promise<void>
    clear: (key: string) => Promise<void>
  }
}

/**
 * Creates DBAL bindings that can be injected into Lua execution context
 */
export function createDBALBindings(adapter: {
  kvGet?: (key: string) => Promise<JsonValue | null>
  kvSet?: (key: string, value: JsonValue, ttl?: number) => Promise<void>
  kvDelete?: (key: string) => Promise<boolean>
  kvListAdd?: (key: string, items: string[]) => Promise<void>
  kvListGet?: (key: string) => Promise<string[]>
  blobUpload?: (name: string, data: Uint8Array, metadata?: Record<string, string>) => Promise<void>
  blobDownload?: (name: string) => Promise<Uint8Array>
  blobDelete?: (name: string) => Promise<void>
  blobList?: () => Promise<string[]>
}): DBALBindings {
  return {
    kv: {
      get: async (key: string) => adapter.kvGet?.(key) ?? null,
      set: async (key: string, value: JsonValue, ttl?: number) => {
        await adapter.kvSet?.(key, value, ttl)
      },
      delete: async (key: string) => (await adapter.kvDelete?.(key)) ?? false,
      listAdd: async (key: string, items: string[]) => {
        await adapter.kvListAdd?.(key, items)
      },
      listGet: async (key: string) => (await adapter.kvListGet?.(key)) ?? [],
    },
    blob: {
      upload: async (name: string, data: string, metadata?: Record<string, string>) => {
        const encoder = new TextEncoder()
        await adapter.blobUpload?.(name, encoder.encode(data), metadata)
      },
      download: async (name: string) => {
        const data = await adapter.blobDownload?.(name)
        if (!data) return ''
        const decoder = new TextDecoder()
        return decoder.decode(data)
      },
      delete: async (name: string) => {
        await adapter.blobDelete?.(name)
      },
      list: async () => (await adapter.blobList?.()) ?? [],
    },
    cache: {
      get: async (key: string) => adapter.kvGet?.(key) ?? null,
      set: async (key: string, value: JsonValue, ttl?: number) => {
        await adapter.kvSet?.(key, value, ttl)
      },
      clear: async (key: string) => {
        await adapter.kvDelete?.(key)
      },
    },
  }
}

/**
 * Lua code template for DBAL operations
 * These functions are available in the Lua context when DBAL bindings are enabled
 */
export const DBAL_LUA_BINDINGS = `
-- DBAL KV Store bindings
function kv_get(key)
  return __dbal_kv_get(key)
end

function kv_set(key, value, ttl)
  return __dbal_kv_set(key, value, ttl)
end

function kv_delete(key)
  return __dbal_kv_delete(key)
end

function kv_list_add(key, items)
  return __dbal_kv_list_add(key, items)
end

function kv_list_get(key)
  return __dbal_kv_list_get(key)
end

-- DBAL Blob Storage bindings
function blob_upload(name, data, metadata)
  return __dbal_blob_upload(name, data, metadata)
end

function blob_download(name)
  return __dbal_blob_download(name)
end

function blob_delete(name)
  return __dbal_blob_delete(name)
end

function blob_list()
  return __dbal_blob_list()
end

-- DBAL Cache bindings
function cache_get(key)
  return __dbal_cache_get(key)
end

function cache_set(key, value, ttl)
  return __dbal_cache_set(key, value, ttl)
end

function cache_clear(key)
  return __dbal_cache_clear(key)
end
`
