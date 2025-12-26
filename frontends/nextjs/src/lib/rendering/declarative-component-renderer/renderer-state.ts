import type { DeclarativeComponentConfig, LuaScriptDefinition } from './types'

export interface DeclarativeRendererState {
  componentConfigs: Record<string, DeclarativeComponentConfig>
  luaScripts: Record<string, LuaScriptDefinition>
}

export function createDeclarativeRendererState(): DeclarativeRendererState {
  return {
    componentConfigs: {},
    luaScripts: {},
  }
}
