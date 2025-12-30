import { LUA_SCRIPT_ALLOWED_GLOBALS } from './lua-script-allowed-globals'

const allowed = new Set(LUA_SCRIPT_ALLOWED_GLOBALS)

export function isAllowedLuaGlobal(value: string): boolean {
  return allowed.has(value)
}
