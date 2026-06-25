import * as fengari from 'fengari-web'

const lua = fengari.lua
const lauxlib = fengari.lauxlib
const lualib = fengari.lualib

export interface LuaExecutionContext {
  data?: any
  user?: any
  kv?: {
    get: (key: string) => Promise<any>
    set: (key: string, value: any) => Promise<void>
  }
  log?: (...args: any[]) => void
}

export interface LuaExecutionResult {
  success: boolean
  result?: any
  error?: string
  logs: string[]
}

export class LuaEngine {
  private L: any
  private logs: string[] = []

  constructor() {
    this.L = lauxlib.luaL_newstate()
    lualib.luaL_openlibs(this.L)
    this.setupContextAPI()
  }

  private setupContextAPI() {
    const self = this
    
    const logFunction = function(L: any) {
      const nargs = lua.lua_gettop(L)
      const messages: string[] = []
      
      for (let i = 1; i <= nargs; i++) {
        if (lua.lua_isstring(L, i)) {
          messages.push(lua.lua_tojsstring(L, i))
        } else if (lua.lua_isnumber(L, i)) {
          messages.push(String(lua.lua_tonumber(L, i)))
        } else if (lua.lua_isboolean(L, i)) {
          messages.push(String(lua.lua_toboolean(L, i)))
        } else {
          messages.push(lua.lua_typename(L, lua.lua_type(L, i)))
        }
      }
      
      self.logs.push(messages.join(' '))
      return 0
    }

    lua.lua_pushcfunction(this.L, logFunction)
    lua.lua_setglobal(this.L, fengari.to_luastring('log'))

    const printFunction = function(L: any) {
      const nargs = lua.lua_gettop(L)
      const messages: string[] = []
      
      for (let i = 1; i <= nargs; i++) {
        if (lua.lua_isstring(L, i)) {
          messages.push(lua.lua_tojsstring(L, i))
        } else if (lua.lua_isnumber(L, i)) {
          messages.push(String(lua.lua_tonumber(L, i)))
        } else if (lua.lua_isboolean(L, i)) {
          messages.push(String(lua.lua_toboolean(L, i)))
        } else {
          messages.push(lua.lua_typename(L, lua.lua_type(L, i)))
        }
      }
      
      self.logs.push(messages.join('\t'))
      return 0
    }

    lua.lua_pushcfunction(this.L, printFunction)
    lua.lua_setglobal(this.L, fengari.to_luastring('print'))
  }

  private pushToLua(value: any) {
    if (value === null || value === undefined) {
      lua.lua_pushnil(this.L)
    } else if (typeof value === 'boolean') {
      lua.lua_pushboolean(this.L, value)
    } else if (typeof value === 'number') {
      lua.lua_pushnumber(this.L, value)
    } else if (typeof value === 'string') {
      lua.lua_pushstring(this.L, fengari.to_luastring(value))
    } else if (Array.isArray(value)) {
      lua.lua_createtable(this.L, value.length, 0)
      value.forEach((item, index) => {
        lua.lua_pushinteger(this.L, index + 1)
        this.pushToLua(item)
        lua.lua_settable(this.L, -3)
      })
    } else if (typeof value === 'object') {
      lua.lua_createtable(this.L, 0, Object.keys(value).length)
      for (const [key, val] of Object.entries(value)) {
        lua.lua_pushstring(this.L, fengari.to_luastring(key))
        this.pushToLua(val)
        lua.lua_settable(this.L, -3)
      }
    } else {
      lua.lua_pushnil(this.L)
    }
  }

  private fromLua(index: number = -1): any {
    const type = lua.lua_type(this.L, index)
    
    switch (type) {
      case lua.LUA_TNIL:
        return null
      case lua.LUA_TBOOLEAN:
        return lua.lua_toboolean(this.L, index)
      case lua.LUA_TNUMBER:
        return lua.lua_tonumber(this.L, index)
      case lua.LUA_TSTRING:
        return lua.lua_tojsstring(this.L, index)
      case lua.LUA_TTABLE:
        return this.tableToJS(index)
      default:
        return null
    }
  }

  private tableToJS(index: number): any {
    const result: any = {}
    let isArray = true
    let arrayIndex = 1
    
    lua.lua_pushnil(this.L)
    
    while (lua.lua_next(this.L, index < 0 ? index - 1 : index) !== 0) {
      const keyType = lua.lua_type(this.L, -2)
      
      if (keyType === lua.LUA_TNUMBER) {
        const key = lua.lua_tonumber(this.L, -2)
        if (key !== arrayIndex) {
          isArray = false
        }
        arrayIndex++
      } else {
        isArray = false
      }
      
      const key = this.fromLua(-2)
      const value = this.fromLua(-1)
      result[key] = value
      
      lua.lua_pop(this.L, 1)
    }
    
    if (isArray && arrayIndex > 1) {
      return Object.values(result)
    }
    
    return result
  }

  async execute(code: string, context: LuaExecutionContext = {}): Promise<LuaExecutionResult> {
    this.logs = []
    
    try {
      lua.lua_createtable(this.L, 0, 3)
      
      if (context.data !== undefined) {
        lua.lua_pushstring(this.L, fengari.to_luastring('data'))
        this.pushToLua(context.data)
        lua.lua_settable(this.L, -3)
      }
      
      if (context.user !== undefined) {
        lua.lua_pushstring(this.L, fengari.to_luastring('user'))
        this.pushToLua(context.user)
        lua.lua_settable(this.L, -3)
      }
      
      const kvMethods: any = {}
      if (context.kv) {
        kvMethods.get = context.kv.get
        kvMethods.set = context.kv.set
      }
      lua.lua_pushstring(this.L, fengari.to_luastring('kv'))
      this.pushToLua(kvMethods)
      lua.lua_settable(this.L, -3)
      
      lua.lua_setglobal(this.L, fengari.to_luastring('context'))
      
      const loadResult = lauxlib.luaL_loadstring(this.L, fengari.to_luastring(code))
      
      if (loadResult !== lua.LUA_OK) {
        const errorMsg = lua.lua_tojsstring(this.L, -1)
        lua.lua_pop(this.L, 1)
        return {
          success: false,
          error: `Syntax error: ${errorMsg}`,
          logs: this.logs,
        }
      }
      
      const execResult = lua.lua_pcall(this.L, 0, lua.LUA_MULTRET, 0)
      
      if (execResult !== lua.LUA_OK) {
        const errorMsg = lua.lua_tojsstring(this.L, -1)
        lua.lua_pop(this.L, 1)
        return {
          success: false,
          error: `Runtime error: ${errorMsg}`,
          logs: this.logs,
        }
      }
      
      const nresults = lua.lua_gettop(this.L)
      let result: any = null
      
      if (nresults > 0) {
        if (nresults === 1) {
          result = this.fromLua(-1)
        } else {
          result = []
          for (let i = 1; i <= nresults; i++) {
            result.push(this.fromLua(-nresults + i - 1))
          }
        }
        lua.lua_pop(this.L, nresults)
      }
      
      return {
        success: true,
        result,
        logs: this.logs,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        logs: this.logs,
      }
    }
  }

  destroy() {
    if (this.L) {
      lua.lua_close(this.L)
    }
  }
}

export function createLuaEngine(): LuaEngine {
  return new LuaEngine()
}
