import type { ComponentTypeDefinition } from './types'

export interface ComponentRegistryState {
  components: Map<string, ComponentTypeDefinition>
}

export function createComponentRegistryState(): ComponentRegistryState {
  return { components: new Map() }
}
