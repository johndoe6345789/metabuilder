import type { DeclarativeRendererState } from '../renderer/renderer-state'

export function hasComponentConfig(
  state: DeclarativeRendererState,
  componentType: string
): boolean {
  return componentType in state.componentConfigs
}
