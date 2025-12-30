import type { DeclarativeRendererState } from '../renderer/renderer-state'
import type { DeclarativeComponentConfig } from '../types'

export function getComponentConfig(
  state: DeclarativeRendererState,
  componentType: string
): DeclarativeComponentConfig | undefined {
  return state.componentConfigs[componentType]
}
