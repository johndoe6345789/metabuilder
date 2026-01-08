import { LuaEngine, LuaExecutionContext, LuaExecutionResult } from './lua-engine'
import { securityScanner, SecurityScanResult } from './security-scanner'
import * as fengari from 'fengari-web'

const lua = fengari.lua
const lauxlib = fengari.lauxlib
const lualib = fengari.lualib

export interface SandboxedLuaResult {
  execution: LuaExecutionResult
  security: SecurityScanResult
}

export class SandboxedLuaEngine {
  private engine: LuaEngine | null = null
  private executionTimeout: number = 5000
  private maxMemory: number = 10 * 1024 * 1024

  constructor(timeout: number = 5000) {
    this.executionTimeout = timeout
  }

  async executeWithSandbox(code: string, context: LuaExecutionContext = {}): Promise<SandboxedLuaResult> {
    const securityResult = securityScanner.scanLua(code)

    if (securityResult.severity === 'critical') {
      return {
        execution: {
          success: false,
          error: 'Code blocked due to critical security issues. Please review the security warnings.',
          logs: []
        },
        security: securityResult
      }
    }

    this.engine = new LuaEngine()
    
    this.disableDangerousFunctions()
    this.setupSandboxedEnvironment()

    const executionPromise = this.executeWithTimeout(code, context)
    
    try {
      const result = await executionPromise
      
      return {
        execution: result,
        security: securityResult
      }
    } catch (error) {
      return {
        execution: {
          success: false,
          error: error instanceof Error ? error.message : 'Execution failed',
          logs: []
        },
        security: securityResult
      }
    } finally {
      if (this.engine) {
        this.engine.destroy()
        this.engine = null
      }
    }
  }

  private disableDangerousFunctions() {
    if (!this.engine) return

    const L = (this.engine as any).L

    lua.lua_pushnil(L)
    lua.lua_setglobal(L, fengari.to_luastring('os'))

    lua.lua_pushnil(L)
    lua.lua_setglobal(L, fengari.to_luastring('io'))

    lua.lua_pushnil(L)
    lua.lua_setglobal(L, fengari.to_luastring('loadfile'))

    lua.lua_pushnil(L)
    lua.lua_setglobal(L, fengari.to_luastring('dofile'))

    lua.lua_getglobal(L, fengari.to_luastring('package'))
    if (!lua.lua_isnil(L, -1)) {
      lua.lua_pushnil(L)
      lua.lua_setfield(L, -2, fengari.to_luastring('loadlib'))
      
      lua.lua_pushnil(L)
      lua.lua_setfield(L, -2, fengari.to_luastring('searchpath'))
      
      lua.lua_pushstring(L, fengari.to_luastring(''))
      lua.lua_setfield(L, -2, fengari.to_luastring('cpath'))
    }
    lua.lua_pop(L, 1)

    lua.lua_getglobal(L, fengari.to_luastring('debug'))
    if (!lua.lua_isnil(L, -1)) {
      lua.lua_pushnil(L)
      lua.lua_setfield(L, -2, fengari.to_luastring('getfenv'))
      
      lua.lua_pushnil(L)
      lua.lua_setfield(L, -2, fengari.to_luastring('setfenv'))
    }
    lua.lua_pop(L, 1)
  }

  private setupSandboxedEnvironment() {
    if (!this.engine) return

    const L = (this.engine as any).L

    lua.lua_newtable(L)

    const safeFunctions = [
      'assert', 'error', 'ipairs', 'next', 'pairs', 'pcall', 'select',
      'tonumber', 'tostring', 'type', 'unpack', 'xpcall',
      'string', 'table', 'math', 'bit32'
    ]

    for (const funcName of safeFunctions) {
      lua.lua_getglobal(L, fengari.to_luastring(funcName))
      lua.lua_setfield(L, -2, fengari.to_luastring(funcName))
    }

    lua.lua_getglobal(L, fengari.to_luastring('print'))
    lua.lua_setfield(L, -2, fengari.to_luastring('print'))
    
    lua.lua_getglobal(L, fengari.to_luastring('log'))
    lua.lua_setfield(L, -2, fengari.to_luastring('log'))

    lua.lua_pushvalue(L, -1)
    lua.lua_setfield(L, -2, fengari.to_luastring('_G'))

    lua.lua_setglobal(L, fengari.to_luastring('_ENV'))
  }

  private async executeWithTimeout(code: string, context: LuaExecutionContext): Promise<LuaExecutionResult> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.engine) {
          this.engine.destroy()
          this.engine = null
        }
        reject(new Error(`Execution timeout: exceeded ${this.executionTimeout}ms limit`))
      }, this.executionTimeout)

      if (!this.engine) {
        clearTimeout(timeout)
        reject(new Error('Engine not initialized'))
        return
      }

      this.engine.execute(code, context)
        .then(result => {
          clearTimeout(timeout)
          resolve(result)
        })
        .catch(error => {
          clearTimeout(timeout)
          reject(error)
        })
    })
  }

  setExecutionTimeout(timeout: number) {
    this.executionTimeout = timeout
  }

  destroy() {
    if (this.engine) {
      this.engine.destroy()
      this.engine = null
    }
  }
}

export function createSandboxedLuaEngine(timeout: number = 5000): SandboxedLuaEngine {
  return new SandboxedLuaEngine(timeout)
}
