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
    defaultValue?: any
    required: boolean
  }>
  config: {
    layout: string
    styling: {
      className: string
    }
    children: any[]
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
  parameters: any[]
  returnType: string
  isSandboxed?: boolean
  allowedGlobals?: string[]
  timeoutMs?: number
}
