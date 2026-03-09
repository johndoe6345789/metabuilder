import { ComponentType } from '@/types/json-ui'
import { componentDefinitions } from '@/lib/component-definitions'

export interface ComponentDefinition {
  type: ComponentType
  label: string
  category: 'layout' | 'input' | 'display' | 'navigation' | 'feedback' | 'data' | 'custom'
  icon: string
  defaultProps?: Record<string, any>
  canHaveChildren?: boolean
}

export function getCategoryComponents(category: string): ComponentDefinition[] {
  return componentDefinitions.filter(component => component.category === category)
}

export function getComponentDef(type: ComponentType): ComponentDefinition | undefined {
  return componentDefinitions.find(component => component.type === type)
}
