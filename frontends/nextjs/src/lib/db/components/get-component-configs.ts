import { getAdapter } from '../dbal-client'
import type { ComponentConfig } from '../types'

export async function getComponentConfigs(): Promise<Record<string, ComponentConfig>> {
  const adapter = getAdapter()
  const result = await adapter.list('ComponentConfig')
  const configs: Record<string, ComponentConfig> = {}
  for (const config of result.data as any[]) {
    configs[config.id] = {
      id: config.id,
      componentId: config.componentId,
      props: JSON.parse(config.props),
      styles: JSON.parse(config.styles),
      events: JSON.parse(config.events),
      conditionalRendering: config.conditionalRendering ? JSON.parse(config.conditionalRendering) : undefined,
    }
  }
  return configs
}
