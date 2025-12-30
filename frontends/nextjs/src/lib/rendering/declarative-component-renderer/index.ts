export { loadPackageComponents } from './components/load-package-components'
export { getDeclarativeRenderer } from './renderer/get-declarative-renderer'
export { DeclarativeComponentRenderer } from './renderer/renderer-class'
export type {
  ComponentBindings,
  DeclarativeComponentConfig,
  LuaScriptDefinition,
  MessageFormat,
} from './types'

// Bridge exports for connecting Lua packages to React hooks
export {
  registerHookBridge,
  getHookBridge,
  hasHookBridge,
  getRegisteredHooks,
  createHookContextFunctions,
  generateHookLuaBindings,
} from './bridge'
export type { HookBridge, HookInstance, PackageBridgeConfig } from './bridge'
