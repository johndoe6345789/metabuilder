import { LUA_EXAMPLES, type LuaExampleKey } from './lua-examples-data'

export function getLuaExampleCode(exampleKey: LuaExampleKey): string {
  return LUA_EXAMPLES[exampleKey] || LUA_EXAMPLES.basic
}
