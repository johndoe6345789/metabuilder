/**
 * Bridge Index
 *
 * Exports package bridge utilities for connecting Lua packages to React hooks
 */

export type { HookBridge, HookInstance, PackageBridgeConfig } from './package-bridge'
export {
  createHookContextFunctions,
  generateHookLuaBindings,
  getHookBridge,
  getRegisteredHooks,
  hasHookBridge,
  registerHookBridge,
} from './package-bridge'
