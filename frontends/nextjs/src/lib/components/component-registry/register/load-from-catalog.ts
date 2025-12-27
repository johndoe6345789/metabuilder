import { componentCatalog } from '../../component-catalog'
import type { ComponentRegistryState } from '../core/registry-state'
import type { ComponentTypeDefinition } from '../core/types'

export function loadFromCatalog(state: ComponentRegistryState): void {
  componentCatalog.forEach(comp => {
    state.components.set(comp.type, comp as ComponentTypeDefinition)
  })
}
