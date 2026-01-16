import type { AppConfiguration } from '@/lib/types/level-types'
import { getAdapter } from '../core/dbal-client'

export async function setAppConfig(config: AppConfiguration): Promise<void> {
  const adapter = getAdapter()

  // Delete existing configs
  const existing = await adapter.list('AppConfiguration')
  const existingConfigs = existing.data as Array<{ id: string }>
  for (const c of existingConfigs) {
    await adapter.delete('AppConfiguration', c.id)
  }

  // Create new config
  await adapter.create('AppConfiguration', {
    id: config.id,
    name: config.name,
    schemas: JSON.stringify(config.schemas),
    workflows: JSON.stringify(config.workflows),
    pages: JSON.stringify(config.pages),
    theme: JSON.stringify(config.theme),
  })
}
