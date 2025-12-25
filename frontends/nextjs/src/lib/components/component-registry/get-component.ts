import type { ComponentRegistryState } from './registry-state'
import type { ComponentTypeDefinition } from './types'

export function getComponent(
  state: ComponentRegistryState,
  type: string
): ComponentTypeDefinition | undefined {
  return state.components.get(type)
}
