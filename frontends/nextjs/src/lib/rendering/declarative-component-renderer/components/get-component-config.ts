import type { DeclarativeComponentConfig } from './types'
import type { DeclarativeRendererState } from './renderer-state'

export function getComponentConfig(
  state: DeclarativeRendererState,
  componentType: string
): DeclarativeComponentConfig | undefined {
  return state.componentConfigs[componentType]
}
