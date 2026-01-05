import type { AppConfiguration } from '@/lib/types/level-types'
import { getAdapter } from '../core/dbal-client'

export async function getAppConfig(): Promise<AppConfiguration | null> {
  const adapter = getAdapter()
  const result = await adapter.list('AppConfiguration', { limit: 1 })
  if (result.data.length === 0) return null
  const config = result.data[0] as {
    id: string
    name: string
    schemas: string
    workflows: string
    luaScripts: string
    pages: string
    theme: string
  }
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
