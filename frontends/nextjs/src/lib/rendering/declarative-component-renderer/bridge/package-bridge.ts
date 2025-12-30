/**
 * Package Bridge
 *
 * Connects Lua packages to React hooks, enabling hybrid components
 * that combine declarative Lua logic with React's reactivity.
 */

import type { JsonValue } from '@/types/utility-types'

import type { ComponentBindings } from '../types'

export interface HookBridge {
  /** Name of the hook */
  name: string
  /** Hook factory function */
  factory: () => HookInstance
}

export interface HookInstance {
  /** Current state */
  state: Record<string, JsonValue>
  /** Available actions */
  actions: Record<string, (...args: unknown[]) => Promise<unknown> | unknown>
  /** Cleanup function */
  cleanup?: () => void
}

export interface PackageBridgeConfig {
  /** Component bindings configuration */
  bindings?: ComponentBindings
  /** Hook factories to register */
  hooks?: HookBridge[]
}

/**
 * Registry of available hook bridges
 */
const hookRegistry = new Map<string, () => HookInstance>()

/**
 * Register a hook bridge factory
 */
export function registerHookBridge(name: string, factory: () => HookInstance) {
  hookRegistry.set(name, factory)
}

/**
 * Get a hook bridge instance by name
 */
export function getHookBridge(name: string): HookInstance | null {
  const factory = hookRegistry.get(name)
  return factory ? factory() : null
}

/**
 * Check if a hook bridge is registered
 */
export function hasHookBridge(name: string): boolean {
  return hookRegistry.has(name)
}

/**
 * Get all registered hook bridge names
 */
export function getRegisteredHooks(): string[] {
  return Array.from(hookRegistry.keys())
}

/**
 * Create Lua context functions from hook bridge
 */
export function createHookContextFunctions(
  hookName: string,
  instance: HookInstance
): Record<string, (...args: unknown[]) => unknown> {
  const prefix = `__hook_${hookName}_`
  const functions: Record<string, (...args: unknown[]) => unknown> = {}

  // State getter
  functions[`${prefix}get_state`] = () => instance.state

  // Action wrappers
  for (const [actionName, action] of Object.entries(instance.actions)) {
    functions[`${prefix}${actionName}`] = action
  }

  return functions
}

/**
 * Generate Lua binding code for a hook bridge
 */
export function generateHookLuaBindings(hookName: string, instance: HookInstance): string {
  const prefix = `__hook_${hookName}_`
  const lines: string[] = [
    `-- Hook bindings for ${hookName}`,
    `local ${hookName} = {}`,
    '',
    `function ${hookName}.get_state()`,
    `  return ${prefix}get_state()`,
    `end`,
    '',
  ]

  for (const actionName of Object.keys(instance.actions)) {
    lines.push(`function ${hookName}.${actionName}(...)`)
    lines.push(`  return ${prefix}${actionName}(...)`)
    lines.push(`end`)
    lines.push('')
  }

  return lines.join('\n')
}

// Pre-register common hook bridges

/**
 * DBAL hook bridge - connects to useDBAL hook
 */
registerHookBridge('dbal', () => ({
  state: {
    isReady: false,
    error: null,
  },
  actions: {
    // These will be connected to actual hook in React component
    connect: async (_endpoint: unknown, _apiKey: unknown) => ({ success: true }),
    disconnect: async () => ({ success: true }),
  },
}))

/**
 * KV Store hook bridge - connects to useKVStore hook
 */
registerHookBridge('kv_store', () => ({
  state: {
    isInitialized: false,
  },
  actions: {
    get: async (_key: unknown) => null,
    set: async (_key: unknown, _value: unknown, _ttl?: unknown) => undefined,
    delete: async (_key: unknown) => false,
    list_add: async (_key: unknown, _items: unknown) => undefined,
    list_get: async (_key: unknown) => [],
  },
}))

/**
 * Blob Storage hook bridge - connects to useBlobStorage hook
 */
registerHookBridge('blob_storage', () => ({
  state: {
    isInitialized: false,
  },
  actions: {
    upload: async (_name: unknown, _data: unknown, _metadata?: unknown) => undefined,
    download: async (_name: unknown) => '',
    delete: async (_name: unknown) => undefined,
    list: async () => [],
  },
}))

/**
 * Cached Data hook bridge - connects to useCachedData hook
 */
registerHookBridge('cached_data', () => ({
  state: {
    data: null,
    loading: false,
    error: null,
    isReady: false,
  },
  actions: {
    save: async (_data: unknown, _ttl?: unknown) => undefined,
    clear: async () => undefined,
    refresh: async () => undefined,
  },
}))
