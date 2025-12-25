import type { ComponentRegistryState } from './registry-state'
import type { ComponentTypeDefinition } from './types'

export function getComponentsByCategory(
  state: ComponentRegistryState,
  category: string
): ComponentTypeDefinition[] {
  return Array.from(state.components.values()).filter(comp => comp.category === category)
}
