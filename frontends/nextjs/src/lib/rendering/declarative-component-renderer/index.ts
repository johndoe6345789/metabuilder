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
export type { HookBridge, HookInstance, PackageBridgeConfig } from './bridge'
export {
  createHookContextFunctions,
  generateHookLuaBindings,
  getHookBridge,
  getRegisteredHooks,
  hasHookBridge,
  registerHookBridge,
} from './bridge'
