import type { ComponentRegistryState } from '../core/registry-state'
import type { ComponentTypeDefinition } from '../core/types'
import { registerComponent } from './register-component'

export function registerComponents(
  state: ComponentRegistryState,
  components: ComponentTypeDefinition[]
): void {
  components.forEach(component => registerComponent(state, component))
}
