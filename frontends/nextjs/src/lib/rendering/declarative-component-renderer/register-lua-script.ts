import type { DeclarativeRendererState } from './renderer-state'
import type { LuaScriptDefinition } from './types'

export function registerLuaScript(
  state: DeclarativeRendererState,
  scriptId: string,
  script: LuaScriptDefinition
): void {
  state.luaScripts[scriptId] = script
}
