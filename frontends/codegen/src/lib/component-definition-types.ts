import { ComponentType } from '@/types/json-ui'

export interface ComponentDefinition {
  type: ComponentType
  label: string
  category: 'layout' | 'input' | 'display' | 'navigation' | 'feedback' | 'data' | 'custom'
  icon: string
  defaultProps?: Record<string, any>
  canHaveChildren?: boolean
  props?: ComponentPropDefinition[]
  events?: ComponentEventDefinition[]
}

export interface ComponentPropDefinition {
  name: string
  type: string
  description: string
  required?: boolean
  defaultValue?: string
  options?: string[]
  supportsBinding?: boolean
}

export interface ComponentEventDefinition {
  name: string
  description: string
}
