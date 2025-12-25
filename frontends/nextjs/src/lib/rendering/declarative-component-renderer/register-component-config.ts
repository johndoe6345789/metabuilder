import type { DeclarativeComponentConfig } from './types'
import type { DeclarativeRendererState } from './renderer-state'

export function registerComponentConfig(
  state: DeclarativeRendererState,
  componentType: string,
  config: DeclarativeComponentConfig
) {
  state.componentConfigs[componentType] = config
}
