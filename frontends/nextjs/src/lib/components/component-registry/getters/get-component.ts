import type { ComponentRegistryState } from '../core/registry-state'
import type { ComponentTypeDefinition } from '../core/types'

export function getComponent(state: ComponentRegistryState, type: string): ComponentTypeDefinition | undefined {
  return state.components.get(type)
}
