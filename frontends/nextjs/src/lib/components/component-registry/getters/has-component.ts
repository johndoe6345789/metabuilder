import type { ComponentRegistryState } from '../core/registry-state'

export function hasComponent(state: ComponentRegistryState, type: string): boolean {
  return state.components.has(type)
}
