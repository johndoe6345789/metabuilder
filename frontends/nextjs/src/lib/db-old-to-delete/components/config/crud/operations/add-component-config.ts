import { getAdapter } from '../../../../core/dbal-client'
import type { ComponentConfig } from '../../../types'

export async function addComponentConfig(config: ComponentConfig): Promise<void> {
  const adapter = getAdapter()
  await adapter.create('ComponentConfig', {
    id: config.id,
    componentId: config.componentId,
    props: JSON.stringify(config.props),
    styles: JSON.stringify(config.styles),
    events: JSON.stringify(config.events),
    conditionalRendering: config.conditionalRendering !== undefined
      ? JSON.stringify(config.conditionalRendering)
      : null,
  })
}
