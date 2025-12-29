import { executeLuaCode } from '@/lib/lua/functions/execution/execute-lua-code'
import { createLuaEngine } from '@/lib/lua/engine/core/create-lua-engine'
import type { LuaUIPackage } from './types/lua-ui-package'
import type { LuaValue } from '@/types/utility-types'

/**
 * Load a Lua UI package from Lua source code
 * Executes the Lua code using existing Fengari engine and converts result to TypeScript types
 */
export async function loadLuaUIPackage(luaSource: string): Promise<LuaUIPackage> {
  // Create Lua engine instance using existing infrastructure
  const engine = createLuaEngine()

  // Execute Lua code and get the returned table
  const executionResult = await executeLuaCode(engine.L, luaSource, {}, [])

  if (!executionResult.success) {
    engine.destroy()
    throw new Error(`Lua execution failed: ${executionResult.error}`)
  }

  const result = executionResult.result

  // Validate result structure
  if (!isLuaUIPackage(result)) {
    engine.destroy()
    throw new Error('Invalid Lua UI package: missing required fields')
  }

  // Clean up engine
  engine.destroy()

  return convertLuaToUIPackage(result)
}

/**
 * Type guard to check if value is a valid Lua UI package
 */
function isLuaUIPackage(value: unknown): value is LuaValue {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const pkg = value as Record<string, unknown>

  // Check required fields
  if (!pkg.metadata || typeof pkg.metadata !== 'object') return false
  if (!pkg.pages || !Array.isArray(pkg.pages)) return false

  const metadata = pkg.metadata as Record<string, unknown>
  if (!metadata.id || typeof metadata.id !== 'string') return false
  if (!metadata.version || typeof metadata.version !== 'string') return false
  if (!metadata.name || typeof metadata.name !== 'string') return false

  return true
}

/**
 * Convert Lua value to TypeScript UI package
 * Uses existing Lua-to-JS converters from the Fengari engine
 */
function convertLuaToUIPackage(luaValue: LuaValue): LuaUIPackage {
  // The fromLua converter already handles this conversion in executeLuaCode
  // We just need to cast to the correct TypeScript type
  return luaValue as unknown as LuaUIPackage
}
