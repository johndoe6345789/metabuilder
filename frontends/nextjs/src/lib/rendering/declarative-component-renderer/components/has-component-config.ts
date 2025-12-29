import type { DeclarativeRendererState } from './renderer-state'

export function hasComponentConfig(
  state: DeclarativeRendererState,
  componentType: string
): boolean {
  return componentType in state.componentConfigs
}
