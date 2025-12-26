import { getAdapter } from '../core/dbal-client'
import type { AppConfiguration } from '../../types/level-types'

export async function getAppConfig(): Promise<AppConfiguration | null> {
  const adapter = getAdapter()
  const result = await adapter.list('AppConfiguration', { limit: 1 })
  if (result.data.length === 0) return null
  const config = result.data[0] as any
  return {
    id: config.id,
    name: config.name,
    schemas: JSON.parse(config.schemas),
    workflows: JSON.parse(config.workflows),
    luaScripts: JSON.parse(config.luaScripts),
    pages: JSON.parse(config.pages),
    theme: JSON.parse(config.theme),
  }
}
