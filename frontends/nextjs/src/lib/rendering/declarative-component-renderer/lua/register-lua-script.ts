import type { LuaScriptDefinition } from './types'
import type { DeclarativeRendererState } from './renderer-state'

export function registerLuaScript(
  state: DeclarativeRendererState,
  scriptId: string,
  script: LuaScriptDefinition
) {
  state.luaScripts[scriptId] = script
}
