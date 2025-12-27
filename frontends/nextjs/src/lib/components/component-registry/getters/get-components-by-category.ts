import type { ComponentRegistryState } from '../core/registry-state'
import type { ComponentTypeDefinition } from '../core/types'

export function getComponentsByCategory(state: ComponentRegistryState, category: string): ComponentTypeDefinition[] {
  return Array.from(state.components.values()).filter(component => component.category === category)
}
