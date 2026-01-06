/**
 * Generate component tree from Lua (stub)
 */

import type { ReactNode } from 'react'

export interface ComponentTree {
  type: string
  props?: Record<string, unknown>
  children?: ComponentTree[]
}

export function generateComponentTree(_luaScript: unknown): ReactNode {
  // TODO: Implement Lua component tree generation
  return null
}
