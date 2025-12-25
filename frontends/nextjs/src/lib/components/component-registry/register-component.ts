import type { ComponentRegistryState } from './registry-state'
import type { ComponentTypeDefinition } from './types'

export function registerComponent(state: ComponentRegistryState, component: ComponentTypeDefinition): void {
  state.components.set(component.type, component)
}
