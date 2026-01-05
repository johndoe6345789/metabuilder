/**
 * Generate component tree from Lua (stub)
 */

export interface ComponentTree {
  type: string
  props?: Record<string, unknown>
  children?: ComponentTree[]
}

export function generateComponentTree(luaScript: string): ComponentTree {
  // TODO: Implement Lua component tree generation
  return { type: 'div' }
}
