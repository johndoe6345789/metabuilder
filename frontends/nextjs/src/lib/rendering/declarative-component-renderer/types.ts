import type { JsonValue } from '@/types/utility-types'

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
