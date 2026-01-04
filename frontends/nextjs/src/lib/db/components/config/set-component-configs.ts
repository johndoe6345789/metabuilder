import { getAdapter } from '../../core/dbal-client'
import type { ComponentConfig } from './types'

type DBALComponentConfigRecord = {
  id: string
}

export async function setComponentConfigs(configs: Record<string, ComponentConfig>): Promise<void> {
  const adapter = getAdapter()

  // Delete existing configs
  const existing = (await adapter.list('ComponentConfig')) as { data: DBALComponentConfigRecord[] }
  for (const c of existing.data) {
    await adapter.delete('ComponentConfig', c.id)
  }

  // Create new configs
  for (const config of Object.values(configs)) {
    await adapter.create('ComponentConfig', {
      id: config.id,
      componentId: config.componentId,
      props: JSON.stringify(config.props),
      styles: JSON.stringify(config.styles),
      events: JSON.stringify(config.events),
      conditionalRendering: config.conditionalRendering
        ? JSON.stringify(config.conditionalRendering)
        : null,
    })
  }
}
