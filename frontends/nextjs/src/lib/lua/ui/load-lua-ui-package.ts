import { readFile } from 'fs/promises'
import { join } from 'path'
import * as fengari from 'fengari-web'
import { createLuaEngine } from '@/lib/lua/engine/core/create-lua-engine'
import { pushToLua } from '@/lib/lua/functions/converters/push-to-lua'
import { fromLua } from '@/lib/lua/functions/converters/from-lua'
import type {
  LuaUIManifest,
  LuaUIPackage,
  LuaUIPage,
  LuaUIComponent,
} from './types/lua-ui-package'

const lua = fengari.lua
const lauxlib = fengari.lauxlib

/**
 * Load a Lua UI package from a directory containing manifest.json and .lua files
 */
export async function loadLuaUIPackage(packagePath: string): Promise<LuaUIPackage> {
  // Read manifest.json
  const manifestPath = join(packagePath, 'manifest.json')
  const manifestContent = await readFile(manifestPath, 'utf-8')
  const manifest: LuaUIManifest = JSON.parse(manifestContent)

  // Load all page files
  const pages: LuaUIPage[] = []
  for (const pageManifest of manifest.pages) {
    const pagePath = join(packagePath, pageManifest.file)
    const pageSource = await readFile(pagePath, 'utf-8')

    const engine = createLuaEngine()
    const L = engine.L

    // Load and execute the Lua file
    const loadResult = lauxlib.luaL_loadstring(L, fengari.to_luastring(pageSource))
    if (loadResult !== lua.LUA_OK) {
      const errorMsg = lua.lua_tojsstring(L, -1)
      lua.lua_pop(L, 1)
      engine.destroy()
      throw new Error(`Failed to load page ${pageManifest.file}: ${errorMsg}`)
    }

    const execResult = lua.lua_pcall(L, 0, 1, 0)
    if (execResult !== lua.LUA_OK) {
      const errorMsg = lua.lua_tojsstring(L, -1)
      lua.lua_pop(L, 1)
      engine.destroy()
      throw new Error(`Failed to execute page ${pageManifest.file}: ${errorMsg}`)
    }

    // Module table should now be on the stack
    if (!lua.lua_istable(L, -1)) {
      engine.destroy()
      throw new Error(`Page ${pageManifest.file} must return a table`)
    }

    // Get the render function from the module
    lua.lua_getfield(L, -1, fengari.to_luastring('render'))
    if (!lua.lua_isfunction(L, -1)) {
      lua.lua_pop(L, 2)
      engine.destroy()
      throw new Error(`Page ${pageManifest.file} must have a render() function`)
    }

    // Call the render function
    const renderResult = lua.lua_pcall(L, 0, 1, 0)
    if (renderResult !== lua.LUA_OK) {
      const errorMsg = lua.lua_tojsstring(L, -1)
      lua.lua_pop(L, 1)
      engine.destroy()
      throw new Error(`Error calling render() in ${pageManifest.file}: ${errorMsg}`)
    }

    // Convert the result to JavaScript
    const layout = fromLua(L, -1) as LuaUIComponent
    lua.lua_pop(L, 2) // Pop result and module table
    engine.destroy()

    pages.push({
      path: pageManifest.path,
      title: pageManifest.title,
      level: pageManifest.level,
      requiresAuth: pageManifest.requiresAuth,
      requiredRole: pageManifest.requiredRole,
      layout,
    })
  }

  // Load all action files
  const actions: Record<string, Function> = {}
  if (manifest.actions) {
    for (const actionManifest of manifest.actions) {
      const actionPath = join(packagePath, actionManifest.file)
      const actionSource = await readFile(actionPath, 'utf-8')

      const engine = createLuaEngine()
      const L = engine.L

      // Load and execute the Lua file
      const loadResult = lauxlib.luaL_loadstring(L, fengari.to_luastring(actionSource))
      if (loadResult !== lua.LUA_OK) {
        const errorMsg = lua.lua_tojsstring(L, -1)
        lua.lua_pop(L, 1)
        engine.destroy()
        throw new Error(`Failed to load actions ${actionManifest.file}: ${errorMsg}`)
      }

      const execResult = lua.lua_pcall(L, 0, 1, 0)
      if (execResult !== lua.LUA_OK) {
        const errorMsg = lua.lua_tojsstring(L, -1)
        lua.lua_pop(L, 1)
        engine.destroy()
        throw new Error(`Failed to execute actions ${actionManifest.file}: ${errorMsg}`)
      }

      // Module table should now be on the stack
      if (!lua.lua_istable(L, -1)) {
        engine.destroy()
        throw new Error(`Action file ${actionManifest.file} must return a table`)
      }

      // Create JavaScript wrapper functions for each Lua function in the module
      // We need to iterate through the table
      lua.lua_pushnil(L)
      while (lua.lua_next(L, -2) !== 0) {
        const key = lua.lua_tojsstring(L, -2)
        const isFunction = lua.lua_isfunction(L, -1)

        if (isFunction && typeof key === 'string') {
          // Create a wrapper that executes the Lua function
          const wrappedFunction = createLuaFunctionWrapper(actionSource, key)
          actions[key] = wrappedFunction
        }

        lua.lua_pop(L, 1)
      }

      lua.lua_pop(L, 1) // Pop module table
      engine.destroy()
    }
  }

  return {
    manifest,
    pages,
    actions,
  }
}

/**
 * Create a JavaScript wrapper function that calls a Lua function
 */
function createLuaFunctionWrapper(luaSource: string, functionName: string): Function {
  return (...args: any[]) => {
    // Create a new Lua engine for this call
    const engine = createLuaEngine()
    const L = engine.L

    // Reload the module
    const loadResult = lauxlib.luaL_loadstring(L, fengari.to_luastring(luaSource))
    if (loadResult !== lua.LUA_OK) {
      engine.destroy()
      throw new Error(`Failed to reload Lua module`)
    }

    const execResult = lua.lua_pcall(L, 0, 1, 0)
    if (execResult !== lua.LUA_OK) {
      engine.destroy()
      throw new Error(`Failed to execute Lua module`)
    }

    // Get the function from the module
    lua.lua_getfield(L, -1, fengari.to_luastring(functionName))
    if (!lua.lua_isfunction(L, -1)) {
      engine.destroy()
      throw new Error(`${functionName} is not a function`)
    }

    // Push arguments
    for (const arg of args) {
      pushToLua(L, arg)
    }

    // Call the function
    const callResult = lua.lua_pcall(L, args.length, 1, 0)
    if (callResult !== lua.LUA_OK) {
      const errorMsg = lua.lua_tojsstring(L, -1)
      engine.destroy()
      throw new Error(`Error calling ${functionName}: ${errorMsg}`)
    }

    // Get the result
    const result = fromLua(L, -1)
    engine.destroy()

    return result
  }
}
