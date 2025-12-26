import { getAdapter } from '../../../../core/dbal-client'

export async function deleteComponentConfig(configId: string): Promise<void> {
  const adapter = getAdapter()
  await adapter.delete('ComponentConfig', configId)
}
