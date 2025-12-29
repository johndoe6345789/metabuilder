import type { LuaUIComponent } from './types/lua-ui-package'

/**
 * Normalize a Lua-converted structure to ensure arrays are properly converted
 * Lua tables with sequential numeric keys (1, 2, 3...) should be JavaScript arrays
 */
export function normalizeLuaStructure(value: any): any {
  if (value === null || value === undefined) {
    return value
  }

  if (Array.isArray(value)) {
    return value.map(normalizeLuaStructure)
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value)

    // Check if this looks like a Lua array (all keys are sequential numbers starting from 1)
    const isLuaArray = keys.every((key) => {
      const num = Number(key)
      return Number.isInteger(num) && num >= 1
    })

    if (isLuaArray && keys.length > 0) {
      // Convert to JavaScript array
      const arr: any[] = []
      const sortedKeys = keys.map(Number).sort((a, b) => a - b)

      for (const key of sortedKeys) {
        arr.push(normalizeLuaStructure(value[key]))
      }

      return arr
    }

    // Otherwise, recursively normalize the object
    const normalized: any = {}
    for (const key of keys) {
      normalized[key] = normalizeLuaStructure(value[key])
    }

    return normalized
  }

  return value
}

/**
 * Normalize a LuaUIComponent structure
 */
export function normalizeLuaComponent(component: any): LuaUIComponent {
  return normalizeLuaStructure(component) as LuaUIComponent
}
