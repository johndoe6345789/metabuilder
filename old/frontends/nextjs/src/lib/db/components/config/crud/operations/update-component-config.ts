import { getAdapter } from '../../../../core/dbal-client'
import type { ComponentConfig } from '../../../types'

export async function updateComponentConfig(
  configId: string,
  updates: Partial<ComponentConfig>
): Promise<void> {
  const adapter = getAdapter()
  const data: Record<string, unknown> = {}
  if (updates.componentId !== undefined) data.componentId = updates.componentId
  if (updates.props !== undefined) data.props = JSON.stringify(updates.props)
  if (updates.styles !== undefined) data.styles = JSON.stringify(updates.styles)
  if (updates.events !== undefined) data.events = JSON.stringify(updates.events)
  if (updates.conditionalRendering !== undefined) {
    data.conditionalRendering = JSON.stringify(updates.conditionalRendering)
  }
  await adapter.update('ComponentConfig', configId, data)
}
