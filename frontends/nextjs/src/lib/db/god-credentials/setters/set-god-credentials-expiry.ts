import { getAdapter } from '../../core/dbal-client'

/**
 * Set god credentials expiry timestamp
 */
export async function setGodCredentialsExpiry(timestamp: number): Promise<void> {
  const adapter = getAdapter()
  await adapter.upsert('SystemConfig', {
    where: { key: 'god_credentials_expiry' },
    update: { value: timestamp.toString() },
    create: { key: 'god_credentials_expiry', value: timestamp.toString() },
  })
}
