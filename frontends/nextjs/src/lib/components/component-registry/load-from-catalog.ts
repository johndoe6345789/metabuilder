import { componentCatalog } from '../component-catalog'
import type { ComponentRegistryState } from './registry-state'
import type { ComponentTypeDefinition } from './types'

export function loadFromCatalog(state: ComponentRegistryState): void {
  componentCatalog.forEach(comp => {
    state.components.set(comp.type, comp as ComponentTypeDefinition)
  })
}
