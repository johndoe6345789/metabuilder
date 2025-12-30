/**
 * Bindings Context
 *
 * Combines DBAL and browser bindings into a unified context
 * that can be injected into Lua script execution.
 */

import type { JsonValue } from '@/types/utility-types'

import { createBrowserBindings, BROWSER_LUA_BINDINGS, type BrowserBindings } from './browser-bindings'
import { createDBALBindings, DBAL_LUA_BINDINGS, type DBALBindings } from './dbal-bindings'

export interface BindingsConfig {
  enableDBAL?: boolean
  enableBrowser?: boolean
  dbalAdapter?: {
    kvGet?: (key: string) => Promise<JsonValue | null>
    kvSet?: (key: string, value: JsonValue, ttl?: number) => Promise<void>
    kvDelete?: (key: string) => Promise<boolean>
    kvListAdd?: (key: string, items: string[]) => Promise<void>
    kvListGet?: (key: string) => Promise<string[]>
    blobUpload?: (name: string, data: Uint8Array, metadata?: Record<string, string>) => Promise<void>
    blobDownload?: (name: string) => Promise<Uint8Array>
    blobDelete?: (name: string) => Promise<void>
    blobList?: () => Promise<string[]>
  }
}

export interface BindingsContext {
  dbal?: DBALBindings
  browser?: BrowserBindings
  luaPrelude: string
  contextFunctions: Record<string, (...args: unknown[]) => unknown>
}

/**
 * Creates a combined bindings context for Lua execution
 */
export function createBindingsContext(config: BindingsConfig = {}): BindingsContext {
  const context: BindingsContext = {
    luaPrelude: '',
    contextFunctions: {},
  }

  // Add DBAL bindings if enabled
  if (config.enableDBAL && config.dbalAdapter) {
    context.dbal = createDBALBindings(config.dbalAdapter)
    context.luaPrelude += DBAL_LUA_BINDINGS + '\n'

    // Register DBAL context functions
    context.contextFunctions['__dbal_kv_get'] = context.dbal.kv.get
    context.contextFunctions['__dbal_kv_set'] = context.dbal.kv.set
    context.contextFunctions['__dbal_kv_delete'] = context.dbal.kv.delete
    context.contextFunctions['__dbal_kv_list_add'] = context.dbal.kv.listAdd
    context.contextFunctions['__dbal_kv_list_get'] = context.dbal.kv.listGet
    context.contextFunctions['__dbal_blob_upload'] = context.dbal.blob.upload
    context.contextFunctions['__dbal_blob_download'] = context.dbal.blob.download
    context.contextFunctions['__dbal_blob_delete'] = context.dbal.blob.delete
    context.contextFunctions['__dbal_blob_list'] = context.dbal.blob.list
    context.contextFunctions['__dbal_cache_get'] = context.dbal.cache.get
    context.contextFunctions['__dbal_cache_set'] = context.dbal.cache.set
    context.contextFunctions['__dbal_cache_clear'] = context.dbal.cache.clear
  }

  // Add browser bindings if enabled
  if (config.enableBrowser) {
    context.browser = createBrowserBindings()
    context.luaPrelude += BROWSER_LUA_BINDINGS + '\n'

    // Register browser context functions
    context.contextFunctions['__browser_page_get_title'] = context.browser.page.getTitle
    context.contextFunctions['__browser_page_get_url'] = context.browser.page.getUrl
    context.contextFunctions['__browser_page_get_viewport'] = context.browser.page.getViewport
    context.contextFunctions['__browser_page_get_user_agent'] = context.browser.page.getUserAgent
    context.contextFunctions['__browser_page_get_text_content'] = context.browser.page.getTextContent
    context.contextFunctions['__browser_page_get_html_sample'] = context.browser.page.getHtmlSample
    context.contextFunctions['__browser_dom_query_selector'] = context.browser.dom.querySelector
    context.contextFunctions['__browser_dom_query_selector_all'] = context.browser.dom.querySelectorAll
    context.contextFunctions['__browser_dom_get_element_count'] = context.browser.dom.getElementCount
    context.contextFunctions['__browser_storage_get_local'] = context.browser.storage.getLocal
    context.contextFunctions['__browser_storage_set_local'] = context.browser.storage.setLocal
    context.contextFunctions['__browser_storage_get_session'] = context.browser.storage.getSession
    context.contextFunctions['__browser_storage_set_session'] = context.browser.storage.setSession
    context.contextFunctions['__browser_clipboard_write_text'] = context.browser.clipboard.writeText
    context.contextFunctions['__browser_clipboard_read_text'] = context.browser.clipboard.readText
  }

  return context
}

/**
 * Combined Lua bindings prelude for scripts that need both DBAL and browser access
 */
export const COMBINED_LUA_BINDINGS = DBAL_LUA_BINDINGS + '\n' + BROWSER_LUA_BINDINGS
