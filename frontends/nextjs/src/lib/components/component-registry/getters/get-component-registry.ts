import { ComponentRegistry } from '../core/registry-class'
import { componentRegistryState } from '../core/registry-singleton'

export function getComponentRegistry(): ComponentRegistry {
  if (!componentRegistryState.instance) {
    componentRegistryState.instance = new ComponentRegistry()
  }
  return componentRegistryState.instance
}
