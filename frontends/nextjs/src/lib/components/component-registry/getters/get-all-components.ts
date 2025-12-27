import type { ComponentRegistryState } from '../core/registry-state'
import type { ComponentTypeDefinition } from '../core/types'

export function getAllComponents(state: ComponentRegistryState): ComponentTypeDefinition[] {
  return Array.from(state.components.values())
}
