import type { ComponentRegistryState } from '../core/registry-state'
import type { ComponentTypeDefinition } from '../core/types'

export function registerComponent(
  state: ComponentRegistryState,
  component: ComponentTypeDefinition
): void {
  state.components.set(component.type, component)
}
