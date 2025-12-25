import type { ComponentRegistryState } from './registry-state'

export function hasComponent(state: ComponentRegistryState, type: string): boolean {
  return state.components.has(type)
}
