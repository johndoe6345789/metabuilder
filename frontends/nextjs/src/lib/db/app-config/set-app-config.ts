import { getAdapter } from '../core/dbal-client'
import type { AppConfiguration } from '../../types/level-types'

export async function setAppConfig(config: AppConfiguration): Promise<void> {
  const adapter = getAdapter()
  
  // Delete existing configs
  const existing = await adapter.list('AppConfiguration')
  for (const c of existing.data as any[]) {
    await adapter.delete('AppConfiguration', c.id)
  }
  
  // Create new config
  await adapter.create('AppConfiguration', {
    id: config.id,
    name: config.name,
    schemas: JSON.stringify(config.schemas),
    workflows: JSON.stringify(config.workflows),
    luaScripts: JSON.stringify(config.luaScripts),
    pages: JSON.stringify(config.pages),
    theme: JSON.stringify(config.theme),
  })
}
