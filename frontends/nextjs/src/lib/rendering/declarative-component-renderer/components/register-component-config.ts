import type { DeclarativeRendererState } from '../renderer/renderer-state'
import type { DeclarativeComponentConfig } from '../types'

export function registerComponentConfig(
  state: DeclarativeRendererState,
  componentType: string,
  config: DeclarativeComponentConfig
) {
  state.componentConfigs[componentType] = config
}
