import type { ComponentRegistryState } from './registry-state'
import type { ComponentTypeDefinition } from './types'
import { registerComponent } from './register-component'

export function registerComponents(state: ComponentRegistryState, components: ComponentTypeDefinition[]): void {
  components.forEach(comp => registerComponent(state, comp))
}
