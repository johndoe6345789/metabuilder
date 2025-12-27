export type LuaBlockType =
  | 'log'
  | 'set_variable'
  | 'if'
  | 'if_else'
  | 'repeat'
  | 'return'
  | 'call'
  | 'comment'

export type BlockSlot = 'root' | 'children' | 'elseChildren'

export type BlockCategory = 'Basics' | 'Logic' | 'Loops' | 'Data' | 'Functions'

export type BlockFieldType = 'text' | 'number' | 'select'

export interface BlockFieldDefinition {
  name: string
  label: string
  placeholder?: string
  type?: BlockFieldType
  defaultValue: string
  options?: Array<{ label: string; value: string }>
}

export interface BlockDefinition {
  type: LuaBlockType
  label: string
  description: string
  category: BlockCategory
  fields: BlockFieldDefinition[]
  hasChildren?: boolean
  hasElseChildren?: boolean
}

export interface LuaBlock {
  id: string
  type: LuaBlockType
  fields: Record<string, string>
  children?: LuaBlock[]
  elseChildren?: LuaBlock[]
}
