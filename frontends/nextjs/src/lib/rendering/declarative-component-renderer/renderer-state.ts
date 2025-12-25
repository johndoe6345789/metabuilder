import { LuaEngine } from '../../lua-engine'
import type { DeclarativeComponentConfig, LuaScriptDefinition } from './types'

export type DeclarativeRendererState = {
  luaEngine: LuaEngine
  componentConfigs: Record<string, DeclarativeComponentConfig>
  luaScripts: Record<string, LuaScriptDefinition>
}

export function createDeclarativeRendererState(): DeclarativeRendererState {
  return {
    luaEngine: new LuaEngine(),
    componentConfigs: {},
    luaScripts: {},
  }
}
