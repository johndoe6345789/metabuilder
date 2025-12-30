/**
 * Lua Executor
 * 
 * Executes Lua scripts from packages using fengari-web.
 * This allows rendering actual Lua packages in Storybook.
 */

import * as fengari from 'fengari-web'
import type { LuaRenderContext, LuaUIComponent } from '../types/lua-types'

const lua = fengari.lua
const lauxlib = fengari.lauxlib
const lualib = fengari.lualib

export interface LuaExecutionResult {
  success: boolean
  result?: LuaUIComponent
  error?: string
  logs: string[]
}

/**
 * Convert a JavaScript value to Lua and push onto stack
 */
function pushToLua(L: unknown, value: unknown): void {
  const state = L as fengari.lua_State
  
  if (value === null || value === undefined) {
    lua.lua_pushnil(state)
  } else if (typeof value === 'boolean') {
    lua.lua_pushboolean(state, value ? 1 : 0)
  } else if (typeof value === 'number') {
    lua.lua_pushnumber(state, value)
  } else if (typeof value === 'string') {
    lua.lua_pushstring(state, fengari.to_luastring(value))
  } else if (Array.isArray(value)) {
    lua.lua_createtable(state, value.length, 0)
    value.forEach((item, index) => {
      pushToLua(state, item)
      lua.lua_rawseti(state, -2, index + 1)
    })
  } else if (typeof value === 'object') {
    lua.lua_createtable(state, 0, Object.keys(value as object).length)
    for (const [key, val] of Object.entries(value as object)) {
      lua.lua_pushstring(state, fengari.to_luastring(key))
      pushToLua(state, val)
      lua.lua_rawset(state, -3)
    }
  }
}

/**
 * Convert a Lua value from stack to JavaScript
 */
function fromLua(L: unknown, index: number): unknown {
  const state = L as fengari.lua_State
  const type = lua.lua_type(state, index)
  
  switch (type) {
    case lua.LUA_TNIL:
      return null
    case lua.LUA_TBOOLEAN:
      return lua.lua_toboolean(state, index) !== 0
    case lua.LUA_TNUMBER:
      return lua.lua_tonumber(state, index)
    case lua.LUA_TSTRING:
      return fengari.to_jsstring(lua.lua_tostring(state, index))
    case lua.LUA_TTABLE: {
      // Check if it's an array (has consecutive integer keys starting at 1)
      const result: Record<string, unknown> = {}
      const arrayPart: unknown[] = []
      let isArray = true
      let maxIndex = 0
      
      lua.lua_pushnil(state)
      while (lua.lua_next(state, index < 0 ? index - 1 : index) !== 0) {
        const keyType = lua.lua_type(state, -2)
        
        if (keyType === lua.LUA_TNUMBER) {
          const idx = lua.lua_tonumber(state, -2)
          if (Number.isInteger(idx) && idx > 0) {
            arrayPart[idx - 1] = fromLua(state, -1)
            maxIndex = Math.max(maxIndex, idx)
          } else {
            isArray = false
          }
        } else if (keyType === lua.LUA_TSTRING) {
          isArray = false
          const key = fengari.to_jsstring(lua.lua_tostring(state, -2))
          result[key] = fromLua(state, -1)
        }
        
        lua.lua_pop(state, 1)
      }
      
      // If all keys are consecutive integers, return as array
      if (isArray && maxIndex === arrayPart.length && maxIndex > 0) {
        return arrayPart
      }
      
      // Mix array part into result
      arrayPart.forEach((val, idx) => {
        result[String(idx + 1)] = val
      })
      
      return result
    }
    default:
      return null
  }
}

/**
 * Normalize Lua output to proper component structure
 */
function normalizeComponent(raw: unknown): LuaUIComponent | null {
  if (!raw || typeof raw !== 'object') return null
  
  const obj = raw as Record<string, unknown>
  
  if (!obj.type || typeof obj.type !== 'string') return null
  
  const component: LuaUIComponent = {
    type: obj.type,
  }
  
  if (obj.props && typeof obj.props === 'object') {
    component.props = obj.props as Record<string, unknown>
  }
  
  if (obj.children) {
    if (Array.isArray(obj.children)) {
      component.children = obj.children
        .map(c => normalizeComponent(c))
        .filter((c): c is LuaUIComponent => c !== null)
    }
  }
  
  return component
}

/**
 * Create a new Lua state with standard libraries
 */
function createLuaState(): fengari.lua_State {
  const L = lauxlib.luaL_newstate()
  lualib.luaL_openlibs(L)
  return L
}

/**
 * Execute a Lua script and call its render function with context
 */
export async function executeLuaRender(
  luaCode: string,
  context: LuaRenderContext,
  functionName = 'render'
): Promise<LuaExecutionResult> {
  const logs: string[] = []
  let L: fengari.lua_State | null = null
  
  try {
    L = createLuaState()
    
    // Override print to capture logs
    lua.lua_pushcfunction(L, (state: fengari.lua_State) => {
      const nargs = lua.lua_gettop(state)
      const parts: string[] = []
      for (let i = 1; i <= nargs; i++) {
        parts.push(String(fromLua(state, i)))
      }
      logs.push(parts.join('\t'))
      return 0
    })
    lua.lua_setglobal(L, fengari.to_luastring('print'))
    
    // Load and execute the Lua code
    const loadResult = lauxlib.luaL_loadstring(L, fengari.to_luastring(luaCode))
    if (loadResult !== lua.LUA_OK) {
      const error = fengari.to_jsstring(lua.lua_tostring(L, -1))
      return { success: false, error: `Load error: ${error}`, logs }
    }
    
    const execResult = lua.lua_pcall(L, 0, 1, 0)
    if (execResult !== lua.LUA_OK) {
      const error = fengari.to_jsstring(lua.lua_tostring(L, -1))
      return { success: false, error: `Execution error: ${error}`, logs }
    }
    
    // Check what we got back
    const returnType = lua.lua_type(L, -1)
    
    if (returnType === lua.LUA_TFUNCTION) {
      // Script returned a function directly (render function)
      pushToLua(L, context)
      const callResult = lua.lua_pcall(L, 1, 1, 0)
      if (callResult !== lua.LUA_OK) {
        const error = fengari.to_jsstring(lua.lua_tostring(L, -1))
        return { success: false, error: `Call error: ${error}`, logs }
      }
    } else if (returnType === lua.LUA_TTABLE) {
      // Script returned a module table, look for render function
      lua.lua_getfield(L, -1, fengari.to_luastring(functionName))
      
      if (lua.lua_isfunction(L, -1)) {
        pushToLua(L, context)
        const callResult = lua.lua_pcall(L, 1, 1, 0)
        if (callResult !== lua.LUA_OK) {
          const error = fengari.to_jsstring(lua.lua_tostring(L, -1))
          return { success: false, error: `Render error: ${error}`, logs }
        }
      } else {
        // The table itself might be the component tree
        lua.lua_pop(L, 1) // Remove the nil/non-function
        // Keep the table on stack
      }
    }
    
    // Convert result to JavaScript
    const rawResult = fromLua(L, -1)
    const result = normalizeComponent(rawResult)
    
    if (!result) {
      return { 
        success: false, 
        error: `Invalid component structure returned`, 
        logs 
      }
    }
    
    return { success: true, result, logs }
    
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : String(err), 
      logs 
    }
  } finally {
    if (L) {
      lua.lua_close(L)
    }
  }
}

/**
 * Load and execute a Lua file from a package
 */
export async function loadAndExecuteLuaFile(
  packageId: string,
  scriptPath: string,
  context: LuaRenderContext
): Promise<LuaExecutionResult> {
  try {
    const response = await fetch(`/packages/${packageId}/seed/scripts/${scriptPath}`)
    if (!response.ok) {
      return { 
        success: false, 
        error: `Failed to load script: ${response.statusText}`, 
        logs: [] 
      }
    }
    
    const luaCode = await response.text()
    return await executeLuaRender(luaCode, context)
    
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : String(err), 
      logs: [] 
    }
  }
}
