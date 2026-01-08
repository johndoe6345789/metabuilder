import { getAdapter } from '../../core/dbal-client'
import type { ComponentConfig } from '../types'

type DBALComponentConfigRecord = {
  id: string
  componentId: string
  props: string
  styles: string
  events: string
  conditionalRendering?: string | null
}

export async function getComponentConfigs(): Promise<Record<string, ComponentConfig>> {
  const adapter = getAdapter()
  const result = (await adapter.list('ComponentConfig')) as { data: DBALComponentConfigRecord[] }
  const configs: Record<string, ComponentConfig> = {}
  for (const config of result.data) {
    configs[config.id] = {
      id: config.id,
      componentId: config.componentId,
      props: JSON.parse(config.props) as Record<string, unknown>,
      styles: JSON.parse(config.styles) as Record<string, unknown>,
      events: JSON.parse(config.events) as Record<string, string>,
      conditionalRendering: config.conditionalRendering !== null && config.conditionalRendering !== undefined
        ? (JSON.parse(config.conditionalRendering) as { condition: string })
        : undefined,
    }
  }
  return configs
}
