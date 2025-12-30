/**
 * Bridge Index
 *
 * Exports package bridge utilities for connecting Lua packages to React hooks
 */

export {
  registerHookBridge,
  getHookBridge,
  hasHookBridge,
  getRegisteredHooks,
  createHookContextFunctions,
  generateHookLuaBindings,
} from './package-bridge'

export type { HookBridge, HookInstance, PackageBridgeConfig } from './package-bridge'
