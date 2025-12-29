import { getAdapter } from '../core/dbal-client'

/**
 * Fetch a SystemConfig value by key.
 */
export async function getSystemConfigValue(key: string): Promise<string | null> {
  const adapter = getAdapter()
  const config = (await adapter.findFirst('SystemConfig', {
    where: { key },
  })) as { value?: string } | null

  return typeof config?.value === 'string' ? config.value : null
}
