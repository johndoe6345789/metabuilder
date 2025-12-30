import type { JsonValue } from '@/types/utility-types'

/**
 * Binding capabilities that can be enabled for a component
 */
export interface ComponentBindings {
  /** Enable DBAL bindings (KV store, blob storage, cache) */
  dbal?: boolean
  /** Enable browser bindings (DOM, page info, storage) */
  browser?: boolean
  /** Custom allowed globals for Lua sandbox */
  allowedGlobals?: string[]
}

export interface DeclarativeComponentConfig {
  type: string
  category: string
  label: string
  description: string
  icon: string
  props: Array<{
    name: string
    type: string
    label: string
    defaultValue?: JsonValue
    required: boolean
  }>
  config: {
    layout: string
    styling: {
      className: string
    }
    children: JsonValue[]
  }
  /** Optional bindings to enable for this component's Lua scripts */
  bindings?: ComponentBindings
  /** React hooks this component requires (for hybrid components) */
  requiredHooks?: string[]
}

export interface MessageFormat {
  id: string
  username: string
  userId: string
  message: string
  timestamp: number
  type: 'message' | 'system' | 'join' | 'leave'
}

export interface LuaScriptDefinition {
  code: string
  parameters: JsonValue[]
  returnType: string
  isSandboxed?: boolean
  allowedGlobals?: string[]
  timeoutMs?: number
}
