import type { LuaUIComponent } from './types/lua-ui-package'
import type { JsonValue } from '@/types/utility-types'

/**
 * Normalize a Lua-converted structure to ensure arrays are properly converted
 * Lua tables with sequential numeric keys (1, 2, 3...) should be JavaScript arrays
 */
export function normalizeLuaStructure(value: JsonValue): JsonValue {
  if (value === null || value === undefined) {
    return value
  }

  if (Array.isArray(value)) {
    return value.map(item => normalizeLuaStructure(item as JsonValue))
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, JsonValue>
    const keys = Object.keys(obj)

    // Check if this looks like a Lua array (all keys are sequential numbers starting from 1)
    const isLuaArray = keys.every((key) => {
      const num = Number(key)
      return Number.isInteger(num) && num >= 1
    })

    if (isLuaArray && keys.length > 0) {
      // Convert to JavaScript array
      const arr: JsonValue[] = []
      const sortedKeys = keys.map(Number).sort((a, b) => a - b)

      for (const key of sortedKeys) {
        arr.push(normalizeLuaStructure(obj[String(key)]))
      }

      return arr
    }

    // Otherwise, recursively normalize the object
    const normalized: Record<string, JsonValue> = {}
    for (const key of keys) {
      normalized[key] = normalizeLuaStructure(obj[key])
    }

    return normalized
  }

  return value
}

/**
 * Normalize a LuaUIComponent structure
 */
export function normalizeLuaComponent(component: JsonValue): LuaUIComponent {
  return normalizeLuaStructure(component) as LuaUIComponent
}
