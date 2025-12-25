import { LUA_EXAMPLES, type LuaExampleKey } from './lua-examples-data'
import { getLuaExampleCode } from './get-lua-example-code'
import { getLuaExamplesList } from './get-lua-examples-list'

export { LUA_EXAMPLES, type LuaExampleKey, getLuaExampleCode, getLuaExamplesList }

export const luaExamples = LUA_EXAMPLES

export class LuaExamples {
  static getLuaExampleCode = getLuaExampleCode
  static getLuaExamplesList = getLuaExamplesList
}
