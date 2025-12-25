import { ComponentRegistry } from './registry-class'
import { componentRegistryState } from './registry-singleton'

export function getComponentRegistry(): ComponentRegistry {
  if (!componentRegistryState.instance) {
    componentRegistryState.instance = new ComponentRegistry()
  }
  return componentRegistryState.instance
}
