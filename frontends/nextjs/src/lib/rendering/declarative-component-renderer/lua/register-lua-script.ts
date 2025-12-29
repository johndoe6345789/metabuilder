import type { DeclarativeRendererState } from './renderer-state'
import type { LuaScriptDefinition } from './types'

export function registerLuaScript(
  state: DeclarativeRendererState,
  scriptId: string,
  script: LuaScriptDefinition
) {
  state.luaScripts[scriptId] = script
}
