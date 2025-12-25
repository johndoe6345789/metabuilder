import type { ComponentRegistryState } from './registry-state'
import type { ComponentTypeDefinition } from './types'

export function getAllComponents(state: ComponentRegistryState): ComponentTypeDefinition[] {
  return Array.from(state.components.values())
}
