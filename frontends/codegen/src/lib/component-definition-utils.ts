import { ComponentDefinition } from '@/lib/component-definition-types'
import { ComponentType } from '@/types/json-ui'
import { componentDefinitions } from '@/lib/component-definitions'

export function getCategoryComponents(category: string): ComponentDefinition[] {
  return componentDefinitions.filter(c => c.category === category)
}

export function getComponentDef(type: ComponentType): ComponentDefinition | undefined {
  return componentDefinitions.find(c => c.type === type)
}
