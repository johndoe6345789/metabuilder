/**
 * Lua UI types (stub)
 */

export interface LuaUIComponent {
  type: string
  props?: Record<string, unknown>
  children?: LuaUIComponent[]
}

export interface LuaUIPackage {
  id: string
  name: string
  components: unknown[]
}
