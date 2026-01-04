/**
 * Lua UI package types
 */
export type LuaUIPackage = any
export interface LuaUIComponent {
  type: string
  props?: Record<string, any>
}
