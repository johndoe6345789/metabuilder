import { getAdapter } from '../dbal-client'

/**
 * Get god credentials expiry timestamp
 */
export async function getGodCredentialsExpiry(): Promise<number> {
  const adapter = getAdapter()
  const config = await adapter.findFirst('SystemConfig', {
    where: { key: 'god_credentials_expiry' },
  })
  return config ? Number(config.value) : 0
}
