import { getAdapter } from '../../core/dbal-client'

/**
 * Get god credentials expiry duration in ms
 */
export async function getGodCredentialsExpiryDuration(): Promise<number> {
  const adapter = getAdapter()
  const config = await adapter.findFirst('SystemConfig', {
    where: { key: 'god_credentials_expiry_duration' },
  }) as { value: string } | null
  return config ? Number(config.value) : 60 * 60 * 1000 // Default 1 hour
}
