import { getLuaExampleCode } from './get-lua-example-code'
import { getLuaExamplesList } from './get-lua-examples-list'
import { LUA_EXAMPLES, type LuaExampleKey } from './lua-examples-data'

export { getLuaExampleCode, getLuaExamplesList, LUA_EXAMPLES, type LuaExampleKey }

export const luaExamples = LUA_EXAMPLES

export class LuaExamples {
  static getLuaExampleCode = getLuaExampleCode
  static getLuaExamplesList = getLuaExamplesList
}
